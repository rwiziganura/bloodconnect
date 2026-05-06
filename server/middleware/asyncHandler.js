/**
 * Async Error Handler Wrapper
 * 
 * Wraps async route handlers to catch ALL errors and prevent server crashes.
 * 
 * Usage:
 * router.post('/register', asyncHandler(async (req, res) => {
 *   // Your code here - errors will be caught automatically
 * }));
 */

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        console.error('\n❌ ASYNC HANDLER ERROR:');
        console.error('   Path:', req.path);
        console.error('   Method:', req.method);
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        console.error('   Stack:', error.stack);
        console.error('');

        // Prevent sending response if headers already sent
        if (res.headersSent) {
          return next(error);
        }

        // Send error response
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
          code: error.code,
          path: req.path,
        });
      });
  };
}

/**
 * Safe Database Query Wrapper
 * 
 * Wraps database queries to ensure connections are always released.
 * 
 * Usage:
 * const result = await safeQuery(pool, 'SELECT * FROM users WHERE id = ?', [userId]);
 */

export async function safeQuery(pool, sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    console.error('\n❌ DATABASE QUERY ERROR:');
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('');
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Validate Required Fields
 * 
 * Validates that all required fields are present in request body.
 * 
 * Usage:
 * validateRequired(req.body, ['name', 'email', 'password']);
 */

export function validateRequired(data, fields) {
  const missing = [];
  
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.status = 400;
    error.fields = missing;
    throw error;
  }
}

/**
 * Safe JSON Response
 * 
 * Safely sends JSON response, preventing crashes if headers already sent.
 */

export function safeJsonResponse(res, statusCode, data) {
  if (res.headersSent) {
    console.warn('⚠️  Headers already sent, cannot send response');
    return;
  }
  
  res.status(statusCode).json(data);
}
