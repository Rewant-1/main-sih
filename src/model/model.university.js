const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true },
  
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
    pincode: { type: String }
  },
  
  // Details
  establishedYear: { type: Number },
  type: {
    type: String,
    enum: ["central", "state", "private", "deemed"],
    default: "state"
  },
  accreditation: { type: String },
  naacGrade: { type: String },
  
  // Media
  logo: { type: String },
  coverImage: { type: String },
  
  // Admin
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Colleges under this university
  colleges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "College"
  }],
  
  // Stats
  totalColleges: { type: Number, default: 0 },
  totalAlumni: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("University", universitySchema);
