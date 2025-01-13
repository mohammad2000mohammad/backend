const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Should be in an environment variable

// Middleware to verify JWT
exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = {
        id:verified.id,
        email:verified.email
     }
     console.log(req.user)
      // Attach the user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};
