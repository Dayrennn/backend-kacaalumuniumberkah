import multer from 'multer';

const storage = multer.memoryStorage(); // buffer, bukan langsung ke cloudinary

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, sesuaikan
});

export default upload;
