import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = (buffer, { folder = 'Home/Assets', publicId } = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId, // opsional, kalau tidak diisi cloudinary generate otomatis
                overwrite: true,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            },
        );
        stream.end(buffer);
    });
};

export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Gagal hapus gambar cloudinary:', error.message);
        // sengaja tidak di-throw, biar tidak menggagalkan proses utama
    }
};
