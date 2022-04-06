const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "charactermovie",
  api_key: "158377269216466",
  api_secret: "FP6X0Qior2ifuHUeXdqiNnwSIv0",
});

module.exports = (namaKolum) => {
  try {
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: (req, file) => {
        return {
          folder: `categoryIcon/${file.fieldname}s`,
          resource_type: "raw",
          public_id:
            path.parse(file.originalname).name +
            " - " +
            new Date().getFullYear() +
            "-" +
            new Date().getMonth() +
            "-" +
            new Date().getDate() +
            " - " +
            new Date().getHours() +
            "-" +
            new Date().getMinutes() +
            "-" +
            new Date().getSeconds() +
            "-" +
            new Date().getMilliseconds() +
            path.extname(file.originalname),
        };
      },
    });

    const upload = multer({
      storage: storage,
    }).single("image_url");

    return (req, res, next) => {
      upload(req, res, (err) => {
        return next();
      });
    };
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
      data: null,
    });
  }
};
