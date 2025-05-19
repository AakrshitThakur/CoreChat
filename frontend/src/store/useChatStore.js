// Import required modules and dependencies
import { create } from "zustand"; // Zustand for state management
import toast from "react-hot-toast"; // For displaying toast notifications
import { axiosInstance } from "../lib/axios"; // Axios instance for API requests
import { useAuthStore } from "./useAuthStore"; // Custom auth store (used to access socket)

// Create and export the Zustand store for chat functionality
export const useChatStore = create((set, get) => ({
  // State variables
  messages: [], // Stores chat messages
  users: [], // Stores list of chat users
  selectedUser: null, // Currently selected user for chat
  isUsersLoading: false, // Loading state for users
  isMessagesLoading: false, // Loading state for messages

  // Fetches the list of users the current user has chatted with
  getUsers: async () => {
    set({ isUsersLoading: true }); // Start loading users
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data }); // Set fetched users
    } catch (error) {
      toast.error(error.response.data.message); // Show error message
    } finally {
      set({ isUsersLoading: false }); // Stop loading
    }
  },

  // Fetches messages for a specific user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true }); // Start loading messages
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data }); // Set fetched messages
    } catch (error) {
      toast.error(error.response.data.message); // Show error message
    } finally {
      set({ isMessagesLoading: false }); // Stop loading
    }
  },

  // Sends a message to the currently selected user
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] }); // Add new message to state
    } catch (error) {
      toast.error(error.response.data.message); // Show error message
    }
  },

  // Subscribes to incoming messages via WebSocket
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      // Append the new message to the chat if it's from the selected user
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Unsubscribes from the WebSocket message listener
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage"); // Remove message event listener
  },

  // Updates the selected user in the state
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
