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

const getEvents = async () => {
  try {
    const events = await Event.find().populate("createdBy").populate("registeredUsers");
    return events;
  } catch (error) {
    throw error;
  }
};

const getEventById = async (eventId) => {
  try {
    const event = await Event.findById(eventId).populate("createdBy").populate("registeredUsers");
    return event;
  } catch (error) {
    throw error;
  }
};

const updateEvent = async (eventId, eventData) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, {
      new: true,
    });
    return updatedEvent;
  } catch (error) {
    throw error;
  }
};

const deleteEvent = async (eventId) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    return deletedEvent;
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
};
