#!/usr/bin/env bash

set -e

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

S3_ENDPOINT="http://localhost:4566"
DYNAMODB_ENDPOINT="http://localhost:8000"
S3_BUCKET="fragments"
DYNAMODB_TABLE="fragments"

echo "Waiting for MiniStack S3..."

until aws \
  --endpoint-url="$S3_ENDPOINT" \
  s3api list-buckets >/dev/null 2>&1
do
  sleep 1
done

echo "MiniStack S3 is ready."

if aws \
  --endpoint-url="$S3_ENDPOINT" \
  s3api head-bucket \
  --bucket "$S3_BUCKET" >/dev/null 2>&1
then
  echo "S3 bucket already exists: $S3_BUCKET"
else
  echo "Creating S3 bucket: $S3_BUCKET"

  aws \
    --endpoint-url="$S3_ENDPOINT" \
    s3api create-bucket \
    --bucket "$S3_BUCKET" \
    --region "$AWS_DEFAULT_REGION"
fi

echo "Waiting for DynamoDB Local..."

until aws \
  --endpoint-url="$DYNAMODB_ENDPOINT" \
  dynamodb list-tables >/dev/null 2>&1
do
  sleep 1
done

echo "DynamoDB Local is ready."

if aws \
  --endpoint-url="$DYNAMODB_ENDPOINT" \
  dynamodb describe-table \
  --table-name "$DYNAMODB_TABLE" >/dev/null 2>&1
then
  echo "DynamoDB table already exists: $DYNAMODB_TABLE"
else
  echo "Creating DynamoDB table: $DYNAMODB_TABLE"

  aws \
    --endpoint-url="$DYNAMODB_ENDPOINT" \
    dynamodb create-table \
    --table-name "$DYNAMODB_TABLE" \
    --attribute-definitions \
      AttributeName=ownerId,AttributeType=S \
      AttributeName=id,AttributeType=S \
    --key-schema \
      AttributeName=ownerId,KeyType=HASH \
      AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region "$AWS_DEFAULT_REGION"
fi

echo "Local AWS setup completed successfully."
