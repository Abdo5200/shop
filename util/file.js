const fs = require("fs");
const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

exports.deleteFile = async (fileUrl) => {
  try {
    const bucket = process.env.AWS_BUCKET_NAME;

    // Extract key from the S3 URL
    const key = decodeURIComponent(fileUrl.split("/").slice(3).join("/"));

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    console.log("✅ S3 file deleted:", key);
  } catch (err) {
    console.error("❌ Failed to delete S3 file:", err);
  }
};
