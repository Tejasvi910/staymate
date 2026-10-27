import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token (JWT) for authenticated users
 * @param {string} userId - User's MongoDB ObjectId string
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'staymate_ai_jwt_super_secret_key_development_only_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, secret, {
    expiresIn,
  });
};

export default generateToken;
