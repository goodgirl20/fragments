#!/usr/bin/env bash

set -e

echo "Creating S3 bucket..."

aws --endpoint-url=http://localhost:4566 \
  s3api create-bucket \
  --bucket fragments \
  --region us-east-1

echo "Creating DynamoDB table..."

aws --endpoint-url=http://localhost:8000 \
  dynamodb create-table \
  --table-name fragments \
  --attribute-definitions \
    AttributeName=ownerId,AttributeType=S \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=ownerId,KeyType=HASH \
    AttributeName=id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

echo "Local AWS setup completed successfully."