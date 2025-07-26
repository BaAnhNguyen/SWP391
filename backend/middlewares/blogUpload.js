const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

//Setting cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Multer upload directly on Cloudinary for blog images
const blogStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog-images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    public_id: (req, file) =>
      Date.now() + "-blog-" + file.originalname.split(".")[0],
    transformation: [
      { width: 1200, height: 800, crop: "limit" }, // Giới hạn kích thước ảnh
      { quality: "auto" }, // Tự động tối ưu chất lượng
    ],
  },
});

const blogUpload = multer({
  storage: blogStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB mỗi file
    files: 1, // Giới hạn tối đa 1 file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    }
  },
});

module.exports = blogUpload;
