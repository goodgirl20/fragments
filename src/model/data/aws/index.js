// src/model/data/aws/index.js

const MemoryDB = require('../memory/memory-db');
const s3Client = require('./s3Client');
const logger = require('../../../logger');

const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

// Temporary metadata database until DynamoDB is added
const memory = MemoryDB;

/**
 * Read fragment metadata.
 */
module.exports.readFragment = async (ownerId, id) => {
  return memory.get(`${ownerId}:${id}`);
};

/**
 * Write fragment metadata.
 */
module.exports.writeFragment = async (fragment) => {
  return memory.put(`${fragment.ownerId}:${fragment.id}`, fragment);
};

/**
 * Convert an S3 response stream into a Buffer.
 */
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

/**
 * Write fragment data to S3.
 */
module.exports.writeFragmentData = async (ownerId, id, data) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (err) {
    logger.error(
      {
        err,
        Bucket: params.Bucket,
        Key: params.Key,
      },
      'Error uploading fragment data to S3'
    );

    throw new Error('unable to upload fragment data', { cause: err });
  }
};

/**
 * Read fragment data from S3.
 */
module.exports.readFragmentData = async (ownerId, id) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  try {
    const result = await s3Client.send(new GetObjectCommand(params));

    return streamToBuffer(result.Body);
  } catch (err) {
    logger.error(
      {
        err,
        Bucket: params.Bucket,
        Key: params.Key,
      },
      'Error reading fragment data from S3'
    );

    throw new Error('unable to read fragment data', { cause: err });
  }
};

/**
 * Delete fragment metadata and S3 data.
 */
module.exports.deleteFragment = async (ownerId, id) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    await memory.del(`${ownerId}:${id}`);
  } catch (err) {
    logger.error(
      {
        err,
        Bucket: params.Bucket,
        Key: params.Key,
      },
      'Error deleting fragment data from S3'
    );

    throw new Error('unable to delete fragment', { cause: err });
  }
};

/**
 * List fragment IDs or expanded metadata.
 */
module.exports.listFragments = async (ownerId, expand = false) => {
  const keys = await memory.list();

  const fragmentKeys = keys
    .filter((key) => key.startsWith(`${ownerId}:`))
    .filter((key) => !key.endsWith(':data'));

  if (!expand) {
    return fragmentKeys.map((key) => key.split(':')[1]);
  }

  return Promise.all(
    fragmentKeys.map(async (key) => {
      return memory.get(key);
    })
  );
};