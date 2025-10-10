const multer = require("multer");
const path = require("path");
const fs = require("fs");

const kycPath = path.join(__dirname, "../uploads/kyc");
if (!fs.existsSync(kycPath)) {
  fs.mkdirSync(kycPath, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, kycPath); // uploads/kyc
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + Math.floor(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;
