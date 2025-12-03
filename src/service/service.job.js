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
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.company) query.company = new RegExp(filters.company, 'i');
    
    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .populate("applicants.student", "name email")
      .sort({ createdAt: -1 });
    return jobs;
  } catch (error) {
    throw error;
  }
};

const getJobById = async (jobId) => {
  try {
    const job = await Job.findById(jobId)
      .populate("postedBy", "name email")
      .populate("applicants.student", "name email");
    return job;
  } catch (error) {
    throw error;
  }
};

const updateJob = async (jobId, jobData) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(
      jobId, 
      { ...jobData, updatedAt: Date.now() },
      { new: true }
    );
    return updatedJob;
  } catch (error) {
    throw error;
  }
};

const deleteJob = async (jobId) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(jobId);
    // Also delete related job applications
    await JobApplication.deleteMany({ jobId });
    return deletedJob;
  } catch (error) {
    throw error;
  }
};

const applyToJob = async (jobId, applicantData) => {
  try {
    // Check if already applied
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    const alreadyApplied = job.applicants.some(
      app => app.student.toString() === applicantData.student.toString()
    );
    
    if (alreadyApplied) {
      throw new Error('Already applied to this job');
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $push: { 
          applicants: {
            student: applicantData.student,
            coverLetter: applicantData.coverLetter,
            resume: applicantData.resume,
            appliedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate("applicants.student", "name email");
    
    // Also create a JobApplication record for tracking
    await JobApplication.create({
      jobId,
      studentId: applicantData.student,
      status: 'applied'
    });
    
    return updatedJob;
  } catch (error) {
    throw error;
  }
};

const updateApplicationStatus = async (jobId, studentId, status) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: jobId, "applicants.student": studentId },
      { $set: { "applicants.$.status": status } },
      { new: true }
    );
    
    // Also update JobApplication record
    await JobApplication.findOneAndUpdate(
      { jobId, studentId },
      { status }
    );
    
    return job;
  } catch (error) {
    throw error;
  }
};

const getJobsByPostedBy = async (userId) => {
  try {
    const jobs = await Job.find({ postedBy: userId })
      .populate("applicants.student", "name email")
      .sort({ createdAt: -1 });
    return jobs;
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
};
