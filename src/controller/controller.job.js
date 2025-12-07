const JobService = require("../service/service.job.js");
const JobModel = require("../model/model.job.js");

// Helper to extract college ID (adminId) from request
const getCollegeId = (req) => {
    return req.admin?.adminId || req.user?.adminId;
};

const createJob = async (req, res) => {
    const { title, company, location, type, isOpen, description, skillsRequired } = req.body;
    if (!title || !company || !type) {
        return res.status(400).json({ success: false, message: "Title, Company, and Type are required fields." });
    }
    try {
        const collegeId = getCollegeId(req);
        if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized: No college ID found." });

        const job = await JobService.createJob({
            ...req.body,
            postedBy: req.user?.userId || req.body.postedBy, // Admin or User
            adminId: collegeId
        });
        res.status(201).json({ success: true, message: "Job created successfully.", data: job });
    } catch (error) {
        console.error("[Jobs] Error creating job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobs = async (req, res) => {
    try {
        const collegeId = getCollegeId(req);
        if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized: No college ID found." });

        const { status, type, company } = req.query;
        const filters = { adminId: collegeId }; // Enforce isolation
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
        const collegeId = getCollegeId(req);
        if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized: No college ID found." });

        const job = await JobService.getJobById(req.params.id, collegeId);
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
        const collegeId = getCollegeId(req);
        if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized: No college ID found." });

        const job = await JobService.updateJob(req.params.id, req.body, collegeId);
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
        const collegeId = getCollegeId(req);
        if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized: No college ID found." });

        const job = await JobService.deleteJob(req.params.id, collegeId);
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
        const collegeId = getCollegeId(req);
        if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized: No college ID found." });

        const studentId = req.user?.userId || req.body.studentId;

        // Verify that job belongs to college? Service should handle this ideally, 
        // but we pass collegeId if service method supports it or we verify here.
        // For now, service.applyToJob might not accept adminId.
        // To be safe, let's verify job existence with collegeId first.
        const job = await JobModel.findOne({ _id: req.params.id, adminId: collegeId });
        if (!job) return res.status(404).json({ success: false, message: "Job not found or access denied." });

        const applicantData = {
            student: studentId,
            coverLetter: req.body.coverLetter,
            resume: req.body.resume,
        };
        const updatedJob = await JobService.applyToJob(req.params.id, applicantData);
        res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
        console.error("[Jobs] Error applying to job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        // Typically Admin or PostedBy.
        // We can check collegeId context.
        const collegeId = getCollegeId(req);
        if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized: No college ID found." });

        const { studentId, status } = req.body;

        // Also verify isolation
        const jobCheck = await JobModel.findOne({ _id: req.params.id, adminId: collegeId });
        if (!jobCheck) return res.status(404).json({ success: false, message: "Job not found or access denied." });

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
        const userId = req.user?.userId || req.body.userId;
        const collegeId = getCollegeId(req);
        // We should ensure we only return jobs for this college (though userId usually implies it).
        // Service.getJobsByPostedBy uses userId.
        const jobs = await JobService.getJobsByPostedBy(userId);
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error("[Jobs] Error fetching my jobs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const closeJobApplications = async (req, res) => {
    try {
        const collegeId = getCollegeId(req);
        if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized: No college ID found." });

        // Verify isolation
        const jobCheck = await JobModel.findOne({ _id: req.params.id, adminId: collegeId });
        if (!jobCheck) return res.status(404).json({ success: false, message: "Job not found or access denied." });

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
