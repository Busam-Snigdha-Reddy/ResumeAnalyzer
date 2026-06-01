export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error('Error Details:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({ message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    return res.status(400).json({ message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ message });
  }

  // Token errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Expired authentication token' });
  }

  res.status(error.statusCode || 500).json({
    message: error.message || 'Server Error',
  });
};
