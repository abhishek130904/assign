// Global error handler — must be registered last in app.js
const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.status || 500).json({ error: err.message, stack: err.stack });
  }
  res.status(err.status || 500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
