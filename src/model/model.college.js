const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true }, // College code
  
  // Contact
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  
  // Address
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: "India" },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  // Details
  establishedYear: { type: Number },
  type: {
    type: String,
    enum: ["government", "private", "autonomous", "deemed"],
    default: "private"
  },
  accreditation: { type: String },
  
  // Departments
  departments: [{
    name: { type: String },
    code: { type: String },
    hod: { type: String }
  }],
  
  // Degrees offered
  degrees: [{
    name: { type: String },
    type: { type: String }, // B.Tech, M.Tech, MBA, etc.
    duration: { type: Number } // in years
  }],
  
  // Media
  logo: { type: String },
  coverImage: { type: String },
  images: [{ type: String }],
  
  // Admin
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // University
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University"
  },
  
  // Stats
  totalAlumni: { type: Number, default: 0 },
  verifiedAlumni: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  
  // Settings
  settings: {
    allowAlumniRegistration: { type: Boolean, default: true },
    requireVerification: { type: Boolean, default: true },
    showDirectory: { type: Boolean, default: true }
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("College", collegeSchema);
