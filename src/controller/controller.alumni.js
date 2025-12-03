const AlumniService = require("../service/service.alumni.js");

const getAlumni = async (req, res) => {
  try {
    const alumni = await AlumniService.getAlumni();
    res.status(200).json({ success: true, data: alumni });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAlumniById = async (req, res) => {
  try {
    const alumni = await AlumniService.getAlumniById(req.params.id);
    if (alumni) {
      res.status(200).json({ success: true, data: alumni });
    } else {
      res.status(404).json({ success: false, error: "Alumni not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateAlumni = async (req, res) => {
  try {
    const alumni = await AlumniService.updateAlumni(req.params.id, req.body);
    if (alumni) {
      res.status(200).json({ success: true, data: alumni });
    } else {
      res.status(404).json({ success: false, error: "Alumni not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAlumni,
  getAlumniById,
  updateAlumni,
};