// src/model/data/aws/index.js

const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const logger = require('../../../logger');

const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * Write fragment metadata to DynamoDB.
 */
module.exports.writeFragment = async (fragment) => {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    logger.error({ err, params, fragment }, 'Error writing fragment metadata to DynamoDB');

    throw new Error('unable to write fragment metadata', {
      cause: err,
    });
  }
};

/**
 * Read fragment metadata from DynamoDB.
 */
module.exports.readFragment = async (ownerId, id) => {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: {
      ownerId,
      id,
    },
  };

  try {
    const result = await ddbDocClient.send(new GetCommand(params));

    return result.Item;
  } catch (err) {
    logger.error({ err, params }, 'Error reading fragment metadata from DynamoDB');

    throw new Error('unable to read fragment metadata', {
      cause: err,
    });
  }
};

/**
 * List fragment IDs or expanded metadata from DynamoDB.
 */
module.exports.listFragments = async (ownerId, expand = false) => {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  try {
    const result = await ddbDocClient.send(new QueryCommand(params));

    const items = result.Items || [];

    if (!expand) {
      return items.map((item) => item.id);
    }

    return items;
  } catch (err) {
    logger.error({ err, params }, 'Error listing fragment metadata from DynamoDB');

    throw new Error('unable to list fragment metadata', {
      cause: err,
    });
  }
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

    throw new Error('unable to upload fragment data', {
      cause: err,
    });
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

    throw new Error('unable to read fragment data', {
      cause: err,
    });
  }
};

/**
 * Delete fragment data from S3 and metadata from DynamoDB.
 */
module.exports.deleteFragment = async (ownerId, id) => {
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const dynamoParams = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: {
      ownerId,
      id,
    },
  };

  try {
    await s3Client.send(new DeleteObjectCommand(s3Params));

    await ddbDocClient.send(new DeleteCommand(dynamoParams));
  } catch (err) {
    logger.error(
      {
        err,
        s3Params,
        dynamoParams,
      },
      'Error deleting fragment from S3 or DynamoDB'
    );

    throw new Error('unable to delete fragment', {
      cause: err,
    });
  }
};
