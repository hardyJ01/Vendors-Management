import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 401, message: 'Access denied. No token provided.', error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ status: 401, message: 'Invalid or expired token.', error: 'Unauthorized' });
  }
};

export default auth;
