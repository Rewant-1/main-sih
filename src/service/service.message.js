const Message = require("../model/model.message.js");

const createMessage = async (messageData) => {
  try {
    const newMessage = new Message(messageData);
    const savedMessage = await newMessage.save();
    return savedMessage;
  } catch (error) {
    throw error;
  }
};

const getMessages = async (chatId) => {
  try {
    const messages = await Message.find({ chatId }).populate("sender");
    return messages;
  } catch (error) {
    throw error;
  }
};

const getMessageById = async (messageId) => {
  try {
    const message = await Message.findById(messageId).populate("sender");
    return message;
  } catch (error) {
    throw error;
  }
};

const updateMessage = async (messageId, messageData) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(messageId, messageData, {
      new: true,
    });
    return updatedMessage;
  } catch (error) {
    throw error;
  }
};

const deleteMessage = async (messageId) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    return deletedMessage;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};
