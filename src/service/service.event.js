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
    // Build filter - if adminId is provided, filter by it; otherwise return all
    const filter = adminId ? { adminId } : {};
    const events = await Event.find(filter)
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
    // Build filter - if adminId is provided, filter by it; otherwise just by id
    const filter = adminId ? { _id: eventId, adminId } : { _id: eventId };
    const event = await Event.findOne(filter)
      .populate("createdBy", "name email")
      .populate("registeredUsers", "name email");
    return event;
  } catch (error) {
    throw error;
  }
};

const updateEvent = async (eventId, eventData, adminId) => {
  try {
    // Build filter - if adminId is provided, filter by it; otherwise just by id
    const filter = adminId ? { _id: eventId, adminId } : { _id: eventId };
    const updatedEvent = await Event.findOneAndUpdate(
      filter,
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
    // Build filter - if adminId is provided, filter by it; otherwise just by id
    const filter = adminId ? { _id: eventId, adminId } : { _id: eventId };
    const deletedEvent = await Event.findOneAndDelete(filter);
    return deletedEvent;
  } catch (error) {
    throw error;
  }
};

const registerForEvent = async (eventId, userId, adminId) => {
  try {
    const event = await Event.findOne({ _id: eventId, adminId });
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
