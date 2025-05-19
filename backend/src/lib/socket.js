// Import the 'Server' class from the 'socket.io' library to enable real-time, bidirectional communication between web clients and servers
import { Server } from "socket.io";

// Import Node.js built-in HTTP module to create an HTTP server
import http from "http";

// Import the Express framework to simplify API routing and server setup
import express from "express";

// Initialize an Express application
const app = express();

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Initialize a new instance of socket.io, attached to the HTTP server
// Configure CORS to allow requests from the specified origin (frontend URL)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // Frontend URL allowed to connect
  },
});

// A map to store the relationship between user IDs and their corresponding socket IDs
// This helps track which users are online and route messages accordingly
const userSocketMap = {}; // Structure: { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Event listener for new socket connections
io.on("connection", (socket) => {
  console.log("A user connected", socket.id); // Log the unique socket ID of the connected client

  // Retrieve the userId sent by the client during the handshake (connection initialization)
  const userId = socket.handshake.query.userId;

  // If a userId was provided, associate it with the connected socket ID in the user map
  if (userId) userSocketMap[userId] = socket.id;

  // Emit the updated list of online users to all connected clients
  // Object.keys() returns an array of all currently online user IDs
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Event listener for when a user disconnects from the socket
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id); // Log the disconnection

    // Remove the user's entry from the map so they're no longer considered online
    delete userSocketMap[userId];

    // Emit the updated list of online users to all clients again
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export the socket instance, express app, and HTTP server for use in other parts of the application
export { io, app, server };
