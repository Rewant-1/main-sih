const BulkImport = require("../model/model.bulkImport");
const Invitation = require("../model/model.invitation");
const User = require("../model/model.user");
const Alumni = require("../model/model.alumni");
const Student = require("../model/model.student");
const auditLogService = require("./service.auditLog");
const csv = require("csv-parse/sync");

class BulkImportService {
  /**
   * Create a new bulk import record
   */
  async createImport(data) {
    const bulkImport = new BulkImport(data);
    await bulkImport.save();
    return bulkImport;
  }

  /**
   * Get import by ID
   */
  async getById(id) {
    return BulkImport.findById(id)
      .populate("importedBy", "name email")
      .lean();
  }

  /**
   * Get imports for a user or college
   */
  async getImports({ importedBy, college, status, page = 1, limit = 20 }) {
    const query = {};
    if (importedBy) query.importedBy = importedBy;
    if (college) query.college = college;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [imports, total] = await Promise.all([
      BulkImport.find(query)
        .populate("importedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BulkImport.countDocuments(query)
    ]);

    return {
      imports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  /**
   * Parse and validate CSV data
   */
  parseCSV(buffer, importType) {
    try {
      const content = buffer.toString('utf-8');
      const records = csv.parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
      });

      return records;
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  }

  /**
   * Validate records based on import type
   */
  async validateRecords(records, importType, options = {}) {
    const validationResults = [];
    const seenEmails = new Set();
    const existingEmails = await this.getExistingEmails(records.map(r => r.email?.toLowerCase()).filter(Boolean));

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // Account for header row and 1-based indexing
      const errors = [];
      const warnings = [];

      // Common validations
      if (!record.email) {
        errors.push({ field: 'email', message: 'Email is required', value: record.email });
      } else if (!this.isValidEmail(record.email)) {
        errors.push({ field: 'email', message: 'Invalid email format', value: record.email });
      } else if (seenEmails.has(record.email.toLowerCase())) {
        errors.push({ field: 'email', message: 'Duplicate email in file', value: record.email });
      } else if (existingEmails.has(record.email.toLowerCase())) {
        if (options.skipDuplicates) {
          warnings.push({ field: 'email', message: 'User already exists (will be skipped)' });
        } else if (!options.updateExisting) {
          errors.push({ field: 'email', message: 'User already exists', value: record.email });
        }
      }

      if (record.email) {
        seenEmails.add(record.email.toLowerCase());
      }

      if (!record.name && !record.firstName) {
        errors.push({ field: 'name', message: 'Name is required' });
      }

      // Type-specific validations
      if (importType === 'alumni') {
        this.validateAlumniRecord(record, errors, warnings);
      } else if (importType === 'students') {
        this.validateStudentRecord(record, errors, warnings);
      }

      validationResults.push({
        rowNumber,
        data: record,
        isValid: errors.length === 0,
        errors,
        warnings
      });
    }

    return validationResults;
  }

  validateAlumniRecord(record, errors, warnings) {
    const graduationYear = parseInt(record.graduationYear);
    if (record.graduationYear && (isNaN(graduationYear) || graduationYear < 1950 || graduationYear > new Date().getFullYear())) {
      errors.push({ field: 'graduationYear', message: 'Invalid graduation year', value: record.graduationYear });
    }

    if (!record.department && !record.branch) {
      warnings.push({ field: 'department', message: 'Department/branch is recommended' });
    }
  }

  validateStudentRecord(record, errors, warnings) {
    const currentYear = parseInt(record.currentYear);
    if (record.currentYear && (isNaN(currentYear) || currentYear < 1 || currentYear > 6)) {
      errors.push({ field: 'currentYear', message: 'Invalid current year', value: record.currentYear });
    }

    if (!record.rollNumber && !record.enrollmentNumber) {
      warnings.push({ field: 'rollNumber', message: 'Roll/Enrollment number is recommended' });
    }
  }

  async getExistingEmails(emails) {
    if (!emails.length) return new Set();
    const users = await User.find({ email: { $in: emails } }).select('email').lean();
    return new Set(users.map(u => u.email.toLowerCase()));
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Process validated records
   */
  async processRecords(importId, validationResults, importType, options, userId) {
    const bulkImport = await BulkImport.findById(importId);
    if (!bulkImport) throw new Error("Import not found");

    bulkImport.status = "processing";
    bulkImport.startedAt = new Date();
    await bulkImport.save();

    const successRecords = [];
    const failedRecords = [];
    let processedCount = 0;

    for (const result of validationResults) {
      if (!result.isValid) {
        failedRecords.push({
          rowNumber: result.rowNumber,
          data: result.data,
          error: result.errors.map(e => e.message).join('; ')
        });
        processedCount++;
        continue;
      }

      try {
        const recordId = await this.createUserFromRecord(result.data, importType, options, bulkImport);
        
        if (recordId) {
          successRecords.push({
            rowNumber: result.rowNumber,
            recordId,
            data: result.data
          });
        } else {
          // Skipped due to duplicate
          bulkImport.skippedRows++;
        }
      } catch (error) {
        failedRecords.push({
          rowNumber: result.rowNumber,
          data: result.data,
          error: error.message
        });
      }

      processedCount++;
      bulkImport.processedRows = processedCount;
      
      // Save progress periodically
      if (processedCount % 50 === 0) {
        await bulkImport.save();
      }
    }

    // Final update
    bulkImport.status = failedRecords.length === validationResults.length ? "failed" : "completed";
    bulkImport.completedAt = new Date();
    bulkImport.successRecords = successRecords;
    bulkImport.failedRecords = failedRecords;
    bulkImport.validRows = successRecords.length;
    bulkImport.invalidRows = failedRecords.length;
    await bulkImport.save();

    // Audit log
    await auditLogService.log({
      action: "BULK_IMPORT",
      resourceType: "BulkImport",
      resourceId: importId,
      actor: userId,
      metadata: {
        importType,
        total: validationResults.length,
        success: successRecords.length,
        failed: failedRecords.length
      },
      status: bulkImport.status === "completed" ? "success" : "failure"
    });

    return bulkImport;
  }

  async createUserFromRecord(record, importType, options, bulkImport) {
    const email = record.email.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (options.skipDuplicates) {
        return null;
      }
      if (options.updateExisting) {
        // Update existing user logic can be added here
        return existingUser._id;
      }
    }

    // Create user
    const name = record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim();
    const userType = importType === 'alumni' ? 'Alumni' : 'Student';

    const user = new User({
      name,
      email,
      password: await this.generateTempPassword(),
      userType,
      isVerified: false,
      profileComplete: false
    });
    await user.save();

    // Create type-specific profile
    if (importType === 'alumni') {
      const alumni = new Alumni({
        user: user._id,
        graduationYear: parseInt(record.graduationYear) || null,
        department: record.department || record.branch,
        degreeType: record.degreeType || record.degree,
        degreeName: record.degreeName || record.program,
        currentCompany: record.company || record.currentCompany,
        currentPosition: record.position || record.designation,
        location: record.location || record.city
      });
      await alumni.save();
    } else if (importType === 'students') {
      const student = new Student({
        user: user._id,
        currentYear: parseInt(record.currentYear) || 1,
        department: record.department || record.branch,
        enrollmentNumber: record.rollNumber || record.enrollmentNumber
      });
      await student.save();
    }

    // Create invitation if needed
    if (options.sendInvitations) {
      await Invitation.create({
        email,
        name,
        type: userType.toLowerCase(),
        invitedBy: bulkImport.importedBy,
        college: bulkImport.college,
        bulkImport: bulkImport._id,
        createdUser: user._id,
        prefillData: {
          graduationYear: parseInt(record.graduationYear),
          department: record.department || record.branch
        }
      });
    }

    return user._id;
  }

  async generateTempPassword() {
    const bcrypt = require('bcryptjs');
    const tempPassword = Math.random().toString(36).slice(-12);
    return bcrypt.hash(tempPassword, 10);
  }

  /**
   * Update import status
   */
  async updateStatus(id, status, additionalData = {}) {
    return BulkImport.findByIdAndUpdate(
      id,
      { status, ...additionalData },
      { new: true }
    );
  }

  /**
   * Cancel import
   */
  async cancelImport(id) {
    return this.updateStatus(id, "cancelled");
  }

  /**
   * Get import template columns
   */
  getTemplateColumns(importType) {
    const columns = {
      students: [
        "email", "name", "firstName", "lastName", "rollNumber",
        "department", "currentYear", "phone"
      ],
      alumni: [
        "email", "name", "firstName", "lastName", "graduationYear",
        "department", "degreeType", "degreeName", "company",
        "position", "location", "phone", "linkedin"
      ],
      events: [
        "title", "description", "eventDate", "eventTime",
        "venue", "type", "capacity"
      ],
      jobs: [
        "title", "company", "description", "location",
        "type", "salary", "requirements", "deadline"
      ]
    };

    return columns[importType] || [];
  }
}

module.exports = new BulkImportService();
