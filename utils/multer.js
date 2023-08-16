const multer = require("multer");
const uuid = require("uuid").v4;

exports.storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${uuid()}_${file.originalname}`);
    },
});

exports.fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/jpeg") {
        cb(null, true);
    } else {
        cb("تنها پسوند JPEG پشتیبانی میشود", false);
    }
};