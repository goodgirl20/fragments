/**
 * S3 configuration and client.
 */

const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

const getCredentials = () => {
  if (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  ) {
    logger.debug(
      'Using AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY for S3'
    );

    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }

  return undefined;
};

const getS3Endpoint = () => {
  if (process.env.AWS_S3_ENDPOINT_URL) {
    logger.debug(
      { endpoint: process.env.AWS_S3_ENDPOINT_URL },
      'Using alternate S3 endpoint'
    );

    return process.env.AWS_S3_ENDPOINT_URL;
  }

  return undefined;
};

module.exports = new S3Client({
  region: process.env.AWS_REGION,
  credentials: getCredentials(),
  endpoint: getS3Endpoint(),
  forcePathStyle: true,
});