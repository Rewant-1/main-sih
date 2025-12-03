const Chat = require("../model/model.chat.js");

const createChat = async (chatData) => {
  try {
    const newChat = new Chat(chatData);
    const savedChat = await newChat.save();
    return savedChat;
  } catch (error) {
    throw error;
  }
};

const getChats = async () => {
  try {
    const chats = await Chat.find()
      .populate({ path: "alumniId", populate: { path: "userId", select: "name email" } })
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } });
    return chats;
  } catch (error) {
    throw error;
  }
};

const getChatById = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate({ path: "alumniId", populate: { path: "userId", select: "name email" } })
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } });
    return chat;
  } catch (error) {
    throw error;
  }
};

const getChatsByUser = async (userId, userType) => {
  try {
    const query = userType === 'Alumni' 
      ? { alumniId: userId } 
      : { studentId: userId };
    const chats = await Chat.find(query)
      .populate({ path: "alumniId", populate: { path: "userId", select: "name email" } })
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } });
    return chats;
  } catch (error) {
    throw error;
  }
};

const addMessage = async (chatId, messageData) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: messageData } },
      { new: true }
    );
    return chat;
  } catch (error) {
    throw error;
  }
};

const updateChat = async (chatId, chatData) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(chatId, chatData, {
      new: true,
    });
    return updatedChat;
  } catch (error) {
    throw error;
  }
};

const deleteChat = async (chatId) => {
  try {
    const deletedChat = await Chat.findByIdAndDelete(chatId);
    return deletedChat;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createChat,
  getChats,
  getChatById,
  getChatsByUser,
  addMessage,
  updateChat,
  deleteChat,
};

