// Zustand: lightweight state-management library for React
import { create } from "zustand";

// Axios instance configured with base URL, interceptors, etc.
import { axiosInstance } from "../lib/axios.js";

// react-hot-toast: for lightweight toast notifications
import toast from "react-hot-toast";

// Socket.IO client for real‑time communication
import { io } from "socket.io-client";

// Determine backend URL based on environment
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// Create a Zustand store for authentication & socket state
export const useAuthStore = create((set, get) => ({
  // --- State variables ---
  authUser: null, // Currently authenticated user object
  isSigningUp: false, // Signup in progress flag
  isLoggingIn: false, // Login in progress flag
  isUpdatingProfile: false, // Profile update in progress flag
  isCheckingAuth: true, // Initial auth-check in progress
  onlineUsers: [], // List of currently online user IDs
  socket: null, // Socket.IO client instance

  // --- Actions / Effects ---

  // Check if user is already authenticated (e.g. via cookie/session)
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      // Store fetched user data
      set({ authUser: res.data });
      // Establish socket connection after auth
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      // Ensure we reset authUser on failure
      set({ authUser: null });
    } finally {
      // Mark auth-check as complete
      set({ isCheckingAuth: false });
    }
  },

  // Register a new user account
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      // Connect socket for real‑time features
      get().connectSocket();
    } catch (error) {
      // Show server‑provided error message
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Log in an existing user
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      // After login, initialize socket connection
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Log out the current user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      // Clear user state
      set({ authUser: null });
      toast.success("Logged out successfully");
      // Tear down socket connection
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Update the authenticated user’s profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      // Save updated user data
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Initialize and connect Socket.IO client
  connectSocket: () => {
    const { authUser, socket } = get();
    // Only connect if user is authenticated and no existing connection
    if (!authUser || socket?.connected) return;

    // Create new socket instance with user ID in query params
    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    // Establish connection
    newSocket.connect();
    // Save socket instance in state
    set({ socket: newSocket });

    // Listen for updates to online users list
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  // Disconnect the Socket.IO client if connected
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
  },
}));
