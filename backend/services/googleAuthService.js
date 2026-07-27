const { OAuth2Client } = require('google-auth-library');
const { AppError } = require('../utils/appError');

function getGoogleClientId() {
  if (!process.env.GOOGLE_CLIENT_ID) throw new AppError('Google sign-in is not configured.', 503);
  return process.env.GOOGLE_CLIENT_ID;
}

const googleClient = new OAuth2Client();

async function verifyGoogleCredential(credential) {
  if (typeof credential !== 'string' || !credential.trim()) {
    throw new AppError('Google credential is required.', 400);
  }
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: getGoogleClientId(),
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new AppError('Google account email could not be verified.', 401);
    }
    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      username: payload.name?.slice(0, 32) || undefined,
      avatar: payload.picture || '',
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Google credential is invalid or expired.', 401);
  }
}

module.exports = { verifyGoogleCredential };
