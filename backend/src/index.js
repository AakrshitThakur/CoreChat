// Import the Express framework for building the web server
import express from "express";

// Load environment variables from a .env file into process.env
import dotenv from "dotenv";

// Parse cookies attached to client requests
import cookieParser from "cookie-parser";

// Enable Cross-Origin Resource Sharing (CORS) for handling requests from different origins
import cors from "cors";

// Utility module for working with file and directory paths
import path from "path";

// Function to connect to the database
import { connectDB } from "./lib/db.js";

// Route handlers for authentication-related endpoints
import authRoutes from "./routes/auth.route.js";

// Route handlers for message-related endpoints
import messageRoutes from "./routes/message.route.js";

// Import the Express app instance and the HTTP server with socket setup
import { app, server } from "./lib/socket.js";

// Initialize dotenv to make environment variables available
dotenv.config();

// Read the port number from environment variables
const PORT = process.env.PORT;

// Resolve the absolute path of the current directory
const __dirname = path.resolve();

// Middleware: Parse incoming JSON payloads and make them available under req.body
app.use(express.json());

// Middleware: Parse cookies from the HTTP Request header and populate req.cookies
app.use(cookieParser());

// Middleware: Configure CORS to allow requests from the frontend application
app.use(
  cors({
    origin: "http://localhost:5173", // Allow this origin to access the server
    credentials: true, // Allow cookies and HTTP authentication
  })
);

// Mount the authentication routes under /api/auth
app.use("/api/auth", authRoutes);

// Mount the message routes under /api/messages
app.use("/api/messages", messageRoutes);

// Serve production assets when in production mode
if (process.env.NODE_ENV === "production") {
  // Serve static files from the frontend build directory
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Fallback: For any routes not handled by the API, serve index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Start the HTTP & WebSocket server and then connect to the database
server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  // Establish a connection to the database after server startup
  connectDB();
});
