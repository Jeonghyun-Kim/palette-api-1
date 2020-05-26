const AWS = require('aws-sdk');

const BUCKETS = {
  PAINTING: 'palette-painting-s3',
  THUMBNAIL: 'palette-painting-thum-s3',
  PROFILE: 'palette-profile-s3'
}

const THUMBNAIL_PERCENTAGE = 25;

// Set the region (other credentials are in process.env)
AWS.config.update({region: 'ap-northeast-2'});

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
  BUCKETS,
  s3,
  THUMBNAIL_PERCENTAGE
}