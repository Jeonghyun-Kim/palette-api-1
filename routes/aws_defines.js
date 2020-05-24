const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

const BUCKETS = {
  PAINTING: 'palette-painting-s3',
  PROFILE: 'palette-profile-s3'
}


// Set the region (other credentials are in process.env)
AWS.config.update({region: 'ap-northeast-2'});

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const getMulterS3 = (fileName, bucketName) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      acl: 'public-read',
      key: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(null, fileName + extension);
      }
    })
  })
}

module.exports = {
  BUCKETS,
  getMulterS3
}