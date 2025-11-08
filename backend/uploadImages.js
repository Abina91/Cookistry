require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cloudinary = require("./utils/cloudinary");

const uploadsFolder = path.join(__dirname, "uploads");

fs.readdirSync(uploadsFolder).forEach(async (file) => {
  const filePath = path.join(uploadsFolder, file);
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: "cookistry" });
    console.log(result.secure_url); // Use this URL in MongoDB
  } catch (err) {
    console.error(err);
  }
});
