// Import the navigation bar component
import Navbar from "./components/Navbar";

// Import page components for routing
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

// Import routing components from React Router
import { Routes, Route, Navigate } from "react-router-dom";

// Import custom hooks for authentication and theme state
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

// Import useEffect for running side effects in the component
import { useEffect } from "react";

// Import a loading spinner icon from the Lucide library
import { Loader } from "lucide-react";

// Import toaster component for notifications
import { Toaster } from "react-hot-toast";

const App = () => {
  // Destructure necessary state and functions from the auth store
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

  // Destructure theme value from the theme store
  const { theme } = useThemeStore();

  // Log the current list of online users (useful for debugging or live user info)
  console.log({ onlineUsers });

  // On initial component mount, check if the user is authenticated
  useEffect(() => {
    checkAuth(); // Triggers a function that checks the user's auth status (e.g., token validation)
  }, [checkAuth]);

  // Log the authenticated user info (also for debugging)
  console.log({ authUser });

  // If the auth check is in progress and there's no authenticated user yet,
  // display a full-screen loading spinner
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // Main component return block once auth check is complete
  return (
    // Apply the selected theme to the app via a data attribute
    <div data-theme={theme}>
      {/* Render the persistent navigation bar */}
      <Navbar />

      {/* Define the application's routes using React Router */}
      <Routes>
        {/* Home page route: accessible only if the user is authenticated */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        {/* Sign-up page route: accessible only if the user is not authenticated */}
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />

        {/* Login page route: accessible only if the user is not authenticated */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        {/* Settings page route: accessible to all users (might need protection depending on app logic) */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* Profile page route: accessible only if the user is authenticated */}
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      {/* Render toaster for displaying temporary toast notifications */}
      <Toaster />
    </div>
  );
};

// Export the App component as default to be used in index.js or main entry point
export default App;
