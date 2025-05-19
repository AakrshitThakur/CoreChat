// Import the 'jsonwebtoken' library to handle JWT token verification
import jwt from "jsonwebtoken";

// Import the User model to query user information from the database
import User from "../models/user.model.js";

// This is a middleware function used to protect certain routes.
// It checks if the incoming request has a valid JWT and attaches the user to the request object if valid.
export const protectRoute = async (req, res, next) => {
  try {
    // Extract the JWT token from the request's cookies
    const token = req.cookies.jwt;

    // If there's no token, respond with 401 Unauthorized
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    // Verify the token using the secret stored in environment variables
    // If verification fails, an error will be thrown and caught by the catch block
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If decoding fails (e.g., token is malformed), respond with 401 Unauthorized
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Look up the user in the database using the userId from the decoded token
    // Exclude the password field from the returned user object for security
    const user = await User.findById(decoded.userId).select("-password");

    // If user is not found in the database, return a 404 Not Found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the authenticated user object to the request so that downstream
    // middleware and route handlers can access user info
    req.user = user;

    // Call next() to pass control to the next middleware/route handler
    next();
  } catch (error) {
    // Catch any errors (e.g., token verification errors, DB errors) and log them
    console.log("Error in protectRoute middleware: ", error.message);

    // Respond with 500 Internal Server Error
    res.status(500).json({ message: "Internal server error" });
  }
};
