const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Use an environment variable for security

// Middleware to verify JWT and check for admin role
exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, SECRET_KEY);

    // Attach the user to the request object
    req.user = {
      id: verified.id,
      email: verified.email,
      role: verified.role, // Include role from token
    };

    console.log('Authenticated user:', req.user);
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Middleware to check for admin role
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next(); // User is an admin, proceed
};
