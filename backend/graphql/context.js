import jwt from 'jsonwebtoken';

// Create context with authentication
const context = async ({ req, connection }) => {
  // For subscriptions
  if (connection) {
    return connection.context;
  }
  
  // For regular queries and mutations
  const authHeader = req.headers.authorization || '';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return { user: null };
  }
};

export default context; 