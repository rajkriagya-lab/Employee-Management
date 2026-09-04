import multer from "multer";

const storage = multer.diskStorage([]);

export const uplod = multer({storage});