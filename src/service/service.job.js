const Job = require("../model/model.job.js");
const JobApplicationsModel = require("../model/model.jobApplication.js");

const createJob = async (jobData) => {
    try {
        const newJob = new Job(jobData);
        const savedJob = await newJob.save();
        return savedJob;
    } catch (error) {
        throw error;
    }
};

const getJobs = async () => {
    try {
        const jobs = await Job.find()
            .populate("postedBy")
            .populate("applicants.student");
        return jobs;
    } catch (error) {
        throw error;
    }
};

const getJobById = async (jobId) => {
    try {
        const job = await Job.findById(jobId)
            .populate("postedBy")
            .populate("applicants.student");
        return job;
    } catch (error) {
        throw error;
    }
};

const updateJob = async (jobId, jobData) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(jobId, jobData, {
            new: true,
        });
        return updatedJob;
    } catch (error) {
        throw error;
    }
};

const deleteJob = async (jobId) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(jobId);
        return deletedJob;
    } catch (error) {
        throw error;
    }
};

const applyToJob = async (jobId, applicantData) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            {
                $push: { applicants: applicantData },
            },
            { new: true }
        );
        return updatedJob;
    } catch (error) {
        throw error;
    }
};

const closeApplications = async (jobId) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            {
                $set: { isOpen: false },
            },
            { new: true }
        );
        return updatedJob;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    applyToJob,
    closeApplications,
};
