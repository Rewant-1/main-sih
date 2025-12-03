const bulkImportService = require("../service/service.bulkImport");
const auditLogService = require("../service/service.auditLog");

// Create a new bulk import (file upload)
const createImport = async (req, res) => {
  try {
    const { importType } = req.body;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    if (!importType || !["students", "alumni", "events", "jobs"].includes(importType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import type. Must be one of: students, alumni, events, jobs"
      });
    }

    // Create import record
    const bulkImport = await bulkImportService.createImport({
      fileName: req.file.originalname,
      fileUrl: req.file.path || req.file.location,
      importType,
      importedBy: userId,
      college: req.body.college,
      options: {
        skipDuplicates: req.body.skipDuplicates !== "false",
        updateExisting: req.body.updateExisting === "true",
        sendInvitations: req.body.sendInvitations === "true",
        validateOnly: req.body.validateOnly === "true"
      }
    });

    // Parse and validate CSV
    const records = bulkImportService.parseCSV(req.file.buffer, importType);
    const validationResults = await bulkImportService.validateRecords(
      records,
      importType,
      bulkImport.options
    );

    // Update import with validation results
    bulkImport.totalRows = records.length;
    bulkImport.validRows = validationResults.filter(r => r.isValid).length;
    bulkImport.invalidRows = validationResults.filter(r => !r.isValid).length;
    bulkImport.validationResults = validationResults.slice(0, 100); // Store preview
    bulkImport.status = "preview";
    await bulkImport.save();

    res.status(201).json({
      success: true,
      message: "File uploaded and validated",
      data: {
        importId: bulkImport._id,
        fileName: bulkImport.fileName,
        importType,
        totalRows: bulkImport.totalRows,
        validRows: bulkImport.validRows,
        invalidRows: bulkImport.invalidRows,
        preview: validationResults.slice(0, 10),
        status: bulkImport.status
      }
    });
  } catch (error) {
    console.error("Create import error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process import file",
      error: error.message
    });
  }
};

// Confirm and process the import
const processImport = async (req, res) => {
  try {
    const { importId } = req.params;
    const userId = req.user.userId;

    const bulkImport = await bulkImportService.getById(importId);

    if (!bulkImport) {
      return res.status(404).json({
        success: false,
        message: "Import not found"
      });
    }

    if (bulkImport.status !== "preview") {
      return res.status(400).json({
        success: false,
        message: `Cannot process import with status: ${bulkImport.status}`
      });
    }

    // Start processing in background
    res.status(202).json({
      success: true,
      message: "Import processing started",
      data: { importId, status: "processing" }
    });

    // Process asynchronously
    try {
      await bulkImportService.processRecords(
        importId,
        bulkImport.validationResults,
        bulkImport.importType,
        bulkImport.options,
        userId
      );
    } catch (processError) {
      console.error("Process import error:", processError);
      await bulkImportService.updateStatus(importId, "failed", {
        errorMessage: processError.message
      });
    }
  } catch (error) {
    console.error("Process import error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process import",
      error: error.message
    });
  }
};

// Get import status
const getImportStatus = async (req, res) => {
  try {
    const { importId } = req.params;

    const bulkImport = await bulkImportService.getById(importId);

    if (!bulkImport) {
      return res.status(404).json({
        success: false,
        message: "Import not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        importId: bulkImport._id,
        fileName: bulkImport.fileName,
        importType: bulkImport.importType,
        status: bulkImport.status,
        progress: bulkImport.progress,
        totalRows: bulkImport.totalRows,
        processedRows: bulkImport.processedRows,
        validRows: bulkImport.validRows,
        invalidRows: bulkImport.invalidRows,
        skippedRows: bulkImport.skippedRows,
        startedAt: bulkImport.startedAt,
        completedAt: bulkImport.completedAt
      }
    });
  } catch (error) {
    console.error("Get import status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch import status",
      error: error.message
    });
  }
};

// Get import results (after completion)
const getImportResults = async (req, res) => {
  try {
    const { importId } = req.params;
    const { type = "all" } = req.query; // all, success, failed

    const bulkImport = await bulkImportService.getById(importId);

    if (!bulkImport) {
      return res.status(404).json({
        success: false,
        message: "Import not found"
      });
    }

    let results = [];
    if (type === "success" || type === "all") {
      results = [...results, ...(bulkImport.successRecords || [])];
    }
    if (type === "failed" || type === "all") {
      results = [...results, ...(bulkImport.failedRecords || [])];
    }

    res.status(200).json({
      success: true,
      data: {
        importId: bulkImport._id,
        status: bulkImport.status,
        summary: {
          total: bulkImport.totalRows,
          success: bulkImport.successRecords?.length || 0,
          failed: bulkImport.failedRecords?.length || 0,
          skipped: bulkImport.skippedRows
        },
        results
      }
    });
  } catch (error) {
    console.error("Get import results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch import results",
      error: error.message
    });
  }
};

// Get list of imports
const getImports = async (req, res) => {
  try {
    const { college, status, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const userType = req.user.userType;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Non-admins can only see their own imports
    if (userType !== "Admin") {
      filters.importedBy = userId;
    }

    if (college) filters.college = college;
    if (status) filters.status = status;

    const result = await bulkImportService.getImports(filters);

    res.status(200).json({
      success: true,
      data: result.imports,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Get imports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch imports",
      error: error.message
    });
  }
};

// Cancel an import
const cancelImport = async (req, res) => {
  try {
    const { importId } = req.params;

    const bulkImport = await bulkImportService.getById(importId);

    if (!bulkImport) {
      return res.status(404).json({
        success: false,
        message: "Import not found"
      });
    }

    if (!["pending", "validating", "preview"].includes(bulkImport.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel import with status: ${bulkImport.status}`
      });
    }

    await bulkImportService.cancelImport(importId);

    res.status(200).json({
      success: true,
      message: "Import cancelled"
    });
  } catch (error) {
    console.error("Cancel import error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel import",
      error: error.message
    });
  }
};

// Get template columns for import type
const getTemplateColumns = async (req, res) => {
  try {
    const { importType } = req.params;

    if (!["students", "alumni", "events", "jobs"].includes(importType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import type"
      });
    }

    const columns = bulkImportService.getTemplateColumns(importType);

    res.status(200).json({
      success: true,
      data: {
        importType,
        columns,
        sampleRow: columns.reduce((acc, col) => {
          acc[col] = `<${col}>`;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get template",
      error: error.message
    });
  }
};

module.exports = {
  createImport,
  processImport,
  getImportStatus,
  getImportResults,
  getImports,
  cancelImport,
  getTemplateColumns
};
