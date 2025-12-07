const Event = require("../model/model.event.js");

const createEvent = async (eventData) => {
  try {
    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();
    return savedEvent;
  } catch (error) {
    throw error;
  }
};

const getEvents = async (adminId) => {
  try {
    const events = await Event.find({ adminId })
      .populate("createdBy", "name email")
      .populate("registeredUsers", "name email")
      .sort({ date: 1 });
    return events;
  } catch (error) {
    throw error;
  }
};

const getEventById = async (eventId, adminId) => {
  try {
    const event = await Event.findOne({ _id: eventId, adminId })
      .populate("createdBy", "name email")
      .populate("registeredUsers", "name email");
    return event;
  } catch (error) {
    throw error;
  }
};

const updateEvent = async (eventId, eventData, adminId) => {
  try {
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, adminId },
      eventData,
      { new: true }
    );
    return updatedEvent;
  } catch (error) {
    throw error;
  }
};

const deleteEvent = async (eventId, adminId) => {
  try {
    const deletedEvent = await Event.findOneAndDelete({ _id: eventId, adminId });
    return deletedEvent;
  } catch (error) {
    throw error;
  }
};

const registerForEvent = async (eventId, userId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return null;
    }
    
    // Check if already registered
    if (event.registeredUsers.includes(userId)) {
      throw new Error("Already registered for this event");
    }
    
    event.registeredUsers.push(userId);
    await event.save();
    
    return await Event.findById(eventId)
      .populate("createdBy", "name email")
      .populate("registeredUsers", "name email");
  } catch (error) {
    throw error;
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
