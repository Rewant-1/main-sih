const AlumniService = require("../service/service.alumni.js");

const getAlumni = async (req, res) => {
  try {
    const alumni = await AlumniService.getAlumni();
    res.status(200).json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAlumniById = async (req, res) => {
  try {
    const alumni = await AlumniService.getAlumniById(req.params.id);
    if (alumni) {
      res.status(200).json(alumni);
    } else {
      res.status(404).json({ message: "Alumni not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAlumni = async (req, res) => {
  try {
    const alumni = await AlumniService.updateAlumni(req.params.id, req.body);
    res.status(200).json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAlumni,
  getAlumniById,
  updateAlumni,
};