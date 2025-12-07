const EventService = require("../service/service.event.js");

const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user?.userId || req.body.createdBy,
      adminId: req.admin.adminId
    };

    // Log incoming data for debugging
    console.log('[Events] Creating event with data:', JSON.stringify(eventData, null, 2));

    const event = await EventService.createEvent(eventData);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('[Events] Error creating event:', error);
    // Return more informative error for validation issues
    const message = error.name === 'ValidationError'
      ? `Validation Error: ${Object.values(error.errors || {}).map(e => e.message).join(', ')}`
      : error.message;
    res.status(500).json({ success: false, message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await EventService.getEvents(req.admin.adminId);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await EventService.getEventById(req.params.id, req.admin.adminId);
    if (event) {
      res.status(200).json({ success: true, data: event });
    } else {
      res.status(404).json({ success: false, message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await EventService.updateEvent(req.params.id, req.body, req.admin.adminId);
    if (event) {
      res.status(200).json({ success: true, data: event });
    } else {
      res.status(404).json({ success: false, message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await EventService.deleteEvent(req.params.id, req.admin.adminId);
    if (event) {
      res.status(200).json({ success: true, message: "Event deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const event = await EventService.registerForEvent(req.params.id, req.user.userId);
    if (event) {
      res.status(200).json({ success: true, data: event });
    } else {
      res.status(404).json({ success: false, message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
};
