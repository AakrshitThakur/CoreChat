// Importing the User and Message models used to interact with the database collections
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// Importing cloudinary utility for image uploads
import cloudinary from "../lib/cloudinary.js";

// Importing socket-related utilities: to get socket ID and access the `io` object to emit events
import { getReceiverSocketId, io } from "../lib/socket.js";

/**
 * Controller: getUsersForSidebar
 * Purpose: Fetch a list of all users except the currently logged-in user for displaying in the sidebar (chat list).
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    // Get the logged-in user's ID from the request object (assuming authentication middleware sets `req.user`)
    const loggedInUserId = req.user._id;

    // Query the User collection to find all users except the logged-in user
    // `.select("-password")` excludes the password field from the returned documents
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
 
    // Send back the list of users with 200 OK
    res.status(200).json(filteredUsers);
  } catch (error) {
    // Log and handle any potential server error
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Controller: getMessages
 * Purpose: Fetch the full conversation between the logged-in user and another user.
 */
export const getMessages = async (req, res) => {
  try {
    // Extract the ID of the user being chatted with from URL parameters
    const { id: userToChatId } = req.params;

    // Get the logged-in user's ID
    const myId = req.user._id;

    // Find all messages exchanged between the two users
    // Using `$or` to match messages sent or received by the logged-in user and the target user
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Send the list of messages with 200 OK
    res.status(200).json(messages);
  } catch (error) {
    // Log and handle any potential server error
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Controller: sendMessage
 * Purpose: Send a new message (text and/or image) from the logged-in user to another user.
 */
export const sendMessage = async (req, res) => {
  try {
    // Destructure text and image (base64 encoded string) from request body
    const { text, image } = req.body;

    // Get the receiver's user ID from the request URL parameter
    const { id: receiverId } = req.params;

    // Get the sender's (logged-in user's) ID
    const senderId = req.user._id;

    let imageUrl;

    // If the message contains an image, upload it to Cloudinary
    if (image) {
      // Upload image and retrieve secure URL for storage
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create a new message document
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // This can be undefined if no image is provided
    });

    // Save the new message to the database
    await newMessage.save();

    // Get the receiver's socket ID (if the user is currently connected)
    const receiverSocketId = getReceiverSocketId(receiverId);

    // If the receiver is online, emit a real-time event to notify them of the new message
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Respond with the saved message object and 201 Created
    res.status(201).json(newMessage);
  } catch (error) {
    // Log and handle any potential server error
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
