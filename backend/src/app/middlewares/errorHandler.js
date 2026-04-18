/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Dữ liệu không tồn tại',
    });
  }

  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đã tồn tại (duplicate)',
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

/**
 * 404 handler
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route không tồn tại: ${req.method} ${req.originalUrl}`,
  });
};

export default { errorHandler, notFound };
