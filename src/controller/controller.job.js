const JobService = require("../service/service.job.js");
const JobModel = require("../model/model.job.js");
const JobApplicationsModel = require("../model/model.jobApplication.js");

const createJob = async (req, res) => {
    const {
        title,
        company,
        location,
        type,
        isOpen,
        description,
        skillsRequired,
    } = req.body;
    if (!title || !company || !type) {
        return res.status(400).json({
            success: false,
            message: "Title, Company, and Type are required fields.",
        });
    }
    try {
        const job = new JobModel({
            title,
            company,
            location,
            type,
            isOpen,
            description,
            skillsRequired,
            postedBy: req.user.userId,
        });
        const savedJob = await job.save();
        return res.status(201).json({
            success: true,
            message: "Job created successfully.",
            data: { job: savedJob },
        });
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobs = async (req, res) => {
    try {
        const jobs = await JobService.getJobs();
        res.status(200).json({ success: true, data: { jobs } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await JobService.getJobById(req.params.id);
        if (job) {
            res.status(200).json({ success: true, data: { job } });
        } else {
            res.status(404).json({ success: false, message: "Job not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const job = await JobService.updateJob(req.params.id, req.body);
        res.status(200).json({ success: true, data: { job } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        await JobService.deleteJob(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const applyToJob = async (req, res) => {
    try {
        const job = await JobService.applyToJob(req.params.id, req.body);
        res.status(200).json({ success: true, data: { job } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const closeJobApplications = async (req, res) => {
    try {
        const job = await JobService.closeApplications(req.params.id);
        res.status(200).json({ success: true, data: { job } });
    } catch (error) {
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
    closeJobApplications,
};
