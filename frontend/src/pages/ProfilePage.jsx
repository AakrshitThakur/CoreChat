// Importing the useState hook from React to manage local state
import { useState } from "react";

// Importing the authentication store to access user data and update functions
import { useAuthStore } from "../store/useAuthStore";

// Importing icons from the lucide-react icon library
import { Camera, Mail, User } from "lucide-react";

// Functional component for the profile page
const ProfilePage = () => {
  // Destructuring the authentication store:
  // - authUser: current user data
  // - isUpdatingProfile: flag to show if a profile update is in progress
  // - updateProfile: function to update user profile
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  // Local state to hold the selected image as a base64 string
  const [selectedImg, setSelectedImg] = useState(null);

  // Handles the image upload event when the user selects a new profile picture
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; // Get the first file selected
    if (!file) return; // If no file selected, exit early

    const reader = new FileReader(); // Create a FileReader to convert image to base64

    reader.readAsDataURL(file); // Convert the image file to a base64 encoded string

    // Once the file is read and converted
    reader.onload = async () => {
      const base64Image = reader.result; // Get the base64 string
      setSelectedImg(base64Image); // Update local state with the image preview
      await updateProfile({ profilePic: base64Image }); // Call function to update profile picture on the server/store
    };
  };

  // JSX returned by the component
  return (
    <div className="h-screen pt-20">
      {/* Centering container with padding */}
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Profile card container */}
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          
          {/* Header section */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Profile picture upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Display the selected image if available, otherwise fallback to user image or default */}
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />

              {/* Camera icon overlay for uploading new photo */}
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden" // Hidden input, triggered by clicking label
                  accept="image/*" // Only accept image files
                  onChange={handleImageUpload} // Upload handler
                  disabled={isUpdatingProfile} // Disable while uploading
                />
              </label>
            </div>

            {/* Status message below image */}
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Displaying user details: full name and email */}
          <div className="space-y-6">
            {/* Full name field */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.fullName}
              </p>
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Additional account information section */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>

            {/* Account meta details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span> {/* Extract just the date */}
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span> {/* Static status for now */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exporting the ProfilePage component for use in the app
export default ProfilePage;
