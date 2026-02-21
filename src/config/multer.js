import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });


export const deleteLocalFile = (filePath) => {
  if (!filePath) return;

  const fullPath = path.join(process.cwd(), filePath);

  fs.unlink(fullPath, (err) => {
    if (err) {
      console.warn("⚠️ Failed to delete file:", err);
    } else {
      console.log("🗑️ Deleted old file:", err);
    }
  });
};
