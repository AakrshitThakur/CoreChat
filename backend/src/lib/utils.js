// Import the 'jsonwebtoken' library to create and manage JSON Web Tokens (JWTs)
import jwt from "jsonwebtoken";

/**
 * Function to generate a JWT token and set it in a secure HTTP-only cookie
 */
export const generateToken = (userId, res) => {
  // Generate a JWT token signed with the user's ID and a secret key
  // 'process.env.JWT_SECRET' should be defined in your environment variables for security
  // The token will expire in 7 days
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Set the token expiration time to 7 days
  });

  // Set the token in an HTTP cookie on the response object
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time in milliseconds (7 days)
    httpOnly: true,                 // Makes the cookie inaccessible to client-side JavaScript (helps prevent XSS attacks)
    sameSite: "strict",             // Ensures the cookie is not sent with cross-site requests (helps prevent CSRF attacks)
    secure: process.env.NODE_ENV !== "development", // Sends the cookie only over HTTPS in production
  });

  // Return the generated token (optional; could be used for logging or additional logic)
  return token;
};
