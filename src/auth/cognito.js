const { CognitoJwtVerifier } = require('aws-jwt-verify');

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  tokenUse: 'id',
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
});

module.exports = async function authorize(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        error: {
          message: 'missing authorization token',
          code: 401,
        },
      });
    }

    const payload = await verifier.verify(token);
    req.user = payload;

    next();
  } catch {
    res.status(401).json({
      status: 'error',
      error: {
        message: 'unauthorized',
        code: 401,
      },
    });
  }
};