// Import state and actions from the custom chat store
import { useChatStore } from "../store/useChatStore";

// Import React hooks
import { useEffect, useRef } from "react";

// Import child components used in the chat interface
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";

// Import user authentication store
import { useAuthStore } from "../store/useAuthStore";

// Utility function for formatting timestamps
import { formatMessageTime } from "../lib/utils";

// Main chat container component
const ChatContainer = () => {
  // Destructure values and actions from the chat store
  const {
    messages, // List of messages between users
    getMessages, // Function to fetch messages from server
    isMessagesLoading, // Boolean flag to show loading state
    selectedUser, // Currently selected user to chat with
    subscribeToMessages, // Function to subscribe to live updates (e.g., WebSocket)
    unsubscribeFromMessages, // Function to unsubscribe from updates
  } = useChatStore();

  // Get the currently authenticated user
  const { authUser } = useAuthStore();

  // Ref used to scroll to the bottom of messages
  const messageEndRef = useRef(null);

  // Fetch messages and set up subscriptions when selected user changes
  useEffect(() => {
    getMessages(selectedUser._id); // Fetch message history for the selected user
    subscribeToMessages(); // Start receiving new messages in real-time

    return () => unsubscribeFromMessages(); // Clean up subscriptions when component unmounts
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" }); // Smooth scrolling
    }
  }, [messages]);

  // Show loading skeleton while messages are being fetched
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Render chat interface when messages are loaded
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Chat header with recipient info or controls */}
      <ChatHeader />

      {/* Message list container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef} // This ref scrolls to the last message
          >
            {/* Avatar image of sender */}
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png" // Auth user's avatar
                      : selectedUser.profilePic || "/avatar.png" // Recipient's avatar
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            {/* Timestamp display */}
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            {/* Chat bubble with text and/or image */}
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>} {/* Text content */}
            </div>
          </div>
        ))}
      </div>

      {/* Input field to send new messages */}
      <MessageInput />
    </div>
  );
};

// Export the component to be used in other parts of the application
export default ChatContainer;
