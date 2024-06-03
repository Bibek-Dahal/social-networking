import multer from "multer";
import path from "path";
import fs from "node:fs";
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/uploads/avatar/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const avatarUpload = multer({ storage: avatarStorage });

const postStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/uploads/posts/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const postUpload = multer({ storage: postStorage });

export { avatarUpload, postUpload };
