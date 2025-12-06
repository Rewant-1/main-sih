const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  graduation_year: Number,
  company: String,
  role: String,
  skills: [String],
  location_visibility: { type: String, enum:['exact','city','country','hidden'], default:'city' },
  location: { type: { type: String, enum:['Point'], default:'Point' }, coordinates: [Number] }, // [lng, lat]
  displayPoint: { type: { type: String, enum:['Point'], default:'Point' }, coordinates: [Number] },
  city: String,
  state: String,
  consent_record: { opt_in: Boolean, timestamp: Date }
});
AlumniSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Alumni', AlumniSchema);
