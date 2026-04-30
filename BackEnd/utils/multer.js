import multer, { diskStorage } from "multer";
// دي المسارات اللي انا محددها تترفع من الصور
export const filterObject = {
  image: ["image/png", "image/jpeg", "image/gif"],
};

export const fileUpload = (filterArray) => {
  const fileFilter = (req, file, cb) => {
    if (!filterArray.includes(file.mimetype)) {
      return cb(new Error(" invalid file format!"), false);
    }
    return cb(null, true);
  };

  return multer({
    storage: multer.memoryStorage(),
    fileFilter,
  });
};