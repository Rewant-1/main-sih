const JobService = require("../service/service.job.js");
const JobModel = require("../model/model.job.js");

const createJob = async (req, res) => {
    const { title, company, location, type, isOpen, description, skillsRequired } = req.body;
    if (!title || !company || !type) {
        return res.status(400).json({ success: false, message: "Title, Company, and Type are required fields." });
    }
    try {
        // Use optional chaining for req.admin
        const adminId = req.admin?.adminId || req.user?.userId || null;
        const job = await JobService.createJob({
            ...req.body,
            postedBy: req.user?.userId,
            adminId: adminId
        });
        res.status(201).json({ success: true, message: "Job created successfully.", data: job });
    } catch (error) {
        console.error("[Jobs] Error creating job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobs = async (req, res) => {
    try {
        const { status, type, company } = req.query;
        // Use optional chaining - adminId may not be available for public routes
        const adminId = req.admin?.adminId || req.user?.userId || null;
        const filters = {};
        if (adminId) filters.adminId = adminId;
        if (status) filters.status = status;
        if (type) filters.type = type;
        if (company) filters.company = company;

        const jobs = await JobService.getJobs(filters);
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error("[Jobs] Error fetching jobs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        // Use optional chaining - adminId may not be available for public routes
        const adminId = req.admin?.adminId || req.user?.userId || null;
        const job = await JobService.getJobById(req.params.id, adminId);
        if (job) {
            res.status(200).json({ success: true, data: job });
        } else {
            res.status(404).json({ success: false, message: "Job not found" });
        }
    } catch (error) {
        console.error("[Jobs] Error fetching job by ID:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const adminId = req.admin?.adminId || req.user?.userId || null;
        const job = await JobService.updateJob(req.params.id, req.body, adminId);
        if (job) {
            res.status(200).json({ success: true, data: job });
        } else {
            res.status(404).json({ success: false, message: "Job not found" });
        }
    } catch (error) {
        console.error("[Jobs] Error updating job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await JobService.deleteJob(req.params.id);
        if (job) {
            res.status(200).json({ success: true, message: "Job deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "Job not found" });
        }
    } catch (error) {
        console.error("[Jobs] Error deleting job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const applyToJob = async (req, res) => {
    try {
        const applicantData = {
            student: req.user?.userId || req.body.studentId,
            coverLetter: req.body.coverLetter,
            resume: req.body.resume,
        };
        const job = await JobService.applyToJob(req.params.id, applicantData);
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        console.error("[Jobs] Error applying to job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { studentId, status } = req.body;
        const job = await JobService.updateApplicationStatus(req.params.id, studentId, status);
        if (job) {
            res.status(200).json({ success: true, data: job });
        } else {
            res.status(404).json({ success: false, message: "Application not found" });
        }
    } catch (error) {
        console.error("[Jobs] Error updating application status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyJobs = async (req, res) => {
    try {
        const jobs = await JobService.getJobsByPostedBy(req.user.userId);
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error("[Jobs] Error fetching my jobs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const closeJobApplications = async (req, res) => {
    try {
        const job = await JobService.closeApplications(req.params.id);
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        console.error("[Jobs] Error closing job applications:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    applyToJob,
    updateApplicationStatus,
    getMyJobs,
    closeJobApplications,
};
