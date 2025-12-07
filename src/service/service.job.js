const Job = require("../model/model.job.js");
const JobApplication = require("../model/model.jobApplication.js");

const createJob = async (jobData) => {
    try {
        const newJob = new Job(jobData);
        const savedJob = await newJob.save();
        return savedJob;
    } catch (error) {
        throw error;
    }
};

const getJobs = async (filters = {}) => {
    try {
        const query = {};
        if (filters.adminId) query.adminId = filters.adminId;
        if (filters.status) query.status = filters.status;
        if (filters.type) query.type = filters.type;
        if (filters.company) query.company = new RegExp(filters.company, "i");

        const jobs = await Job.find(query)
            .populate("postedBy", "name email")
            .populate("applicants.student", "name email")
            .sort({ createdAt: -1 });
        return jobs;
    } catch (error) {
        throw error;
    }
};

const getJobById = async (jobId, adminId) => {
    try {
        const job = await Job.findOne({ _id: jobId, adminId })
            .populate("postedBy", "name email")
            .populate("applicants.student", "name email");
        return job;
    } catch (error) {
        throw error;
    }
};

const updateJob = async (jobId, jobData, adminId) => {
    try {
        const updatedJob = await Job.findOneAndUpdate(
            { _id: jobId, adminId },
            { ...jobData, updatedAt: Date.now() },
            { new: true }
        );
        return updatedJob;
    } catch (error) {
        throw error;
    }
};

const deleteJob = async (jobId, adminId) => {
    try {
        // Verify ownership before deletion
        const deletedJob = await Job.findOneAndDelete({ _id: jobId, adminId });
        if (deletedJob) {
            // Also delete related job applications
            await JobApplication.deleteMany({ jobId });
        }
        return deletedJob;
    } catch (error) {
        throw error;
    }
};

const applyToJob = async (jobId, applicantData) => {
    try {
        // Check if already applied for jobs where applicants array exists
        const job = await Job.findById(jobId);
        if (!job) throw new Error("Job not found");

        const alreadyApplied = job.applicants?.some((app) => app.student.toString() === (applicantData.student?.toString?.() || applicantData.student));
        if (alreadyApplied) throw new Error("Already applied to this job");

        const appToPush = {
            student: applicantData.student,
            coverLetter: applicantData.coverLetter,
            resume: applicantData.resume,
            appliedAt: new Date(),
        };

        const updatedJob = await Job.findByIdAndUpdate(jobId, { $push: { applicants: appToPush } }, { new: true }).populate(
            "applicants.student",
            "name email"
        );

        // Also create a JobApplication record for tracking
        await JobApplication.create({ jobId, studentId: applicantData.student, status: "applied" });

        return updatedJob;
    } catch (error) {
        throw error;
    }
};

const updateApplicationStatus = async (jobId, studentId, status) => {
    try {
        const job = await Job.findOneAndUpdate({ _id: jobId, "applicants.student": studentId }, { $set: { "applicants.$.status": status } }, { new: true });
        await JobApplication.findOneAndUpdate({ jobId, studentId }, { status });
        return job;
    } catch (error) {
        throw error;
    }
};

const getJobsByPostedBy = async (userId) => {
    try {
        const jobs = await Job.find({ postedBy: userId }).populate("applicants.student", "name email").sort({ createdAt: -1 });
        return jobs;
    } catch (error) {
        throw error;
    }
};

const closeApplications = async (jobId) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(jobId, { $set: { isOpen: false } }, { new: true });
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
    updateApplicationStatus,
    getJobsByPostedBy,
    closeApplications,
};
