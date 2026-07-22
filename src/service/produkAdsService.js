import prisma from '../config/prisma.js';
import { deleteFromCloudinary, uploadToCloudinary } from './cloudinaryService.js';
import compressToWebp from '../utils/compressWebp.js';

export const addProdukAds = async ({ barangId, deskripsi, imageBuffer }) => {
    if (!barangId) throw new Error('Barang Tidak Tersedia');
    if (!imageBuffer) throw new Error('Gambar Wajib di Upload');

    const barang = await prisma.barang.findUnique({
        where: { id: barangId },
        select: {
            id: true,
            kategoriId: true,
        },
    });

    if (!barang) {
        throw new Error('Barang Tidak Ditemukan');
    }

    const existingAds = await prisma.produkAds.findFirst({
        where: { barangId },
        select: {
            id: true,
        },
    });

    if (existingAds) {
        throw new Error('Iklan Sudah Ada');
    }

    const compressed = await compressToWebp(imageBuffer, `produk-${barangId}`);
    const uploaded = await uploadToCloudinary(compressed, {
        folder: 'ads',
        publicId: `produk-${barangId}-${Date.now()}`,
    });

    try {
        const newAds = await prisma.produkAds.create({
            data: {
                barangId,
                deskripsi,
                produkImageUrl: uploaded.url,
                produkImagePublicId: uploaded.publicId,
            },
        });

        return newAds;
    } catch (error) {
        await deleteFromCloudinary(uploaded.publicId);
        throw error;
    }
};

export const getProdukAds = async ({ page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * Number(limit);

    const [result, total] = await Promise.all([
        prisma.produkAds.findMany({
            skip,
            take: Number(limit),
            orderBy: { id: 'desc' },
            select: {
                id: true,
                deskripsi: true,
                produkImageUrl: true,
                barangId: true,
                barang: {
                    select: {
                        id: true,
                        namaBarang: true,
                        ukuran: true,
                        status: true,
                        kategori: {
                            select: {
                                namaKategori: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.produkAds.count(),
    ]);

    return {
        data: result,
        meta: {
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const updateProdukAds = async (id, { deskripsi, imageBuffer, barangId }) => {
    const existing = await prisma.produkAds.findUnique({ where: { id } });
    if (!existing) throw new Error('Iklan Tidak Ditemukan');

    let newUpload = null;

    // 1. Upload gambar baru DULU (kalau ada file baru)
    if (imageBuffer) {
        const compressed = await compressToWebp(imageBuffer, `/ads/produk-${existing.barangId}`);
        newUpload = await uploadToCloudinary(compressed, {
            folder: 'ads',
            publicId: `produk-${existing.barangId}-${Date.now()}`,
        });
    }

    try {
        const updated = await prisma.produkAds.update({
            where: { id },
            data: {
                deskripsi: deskripsi ?? existing.deskripsi,
                ...(newUpload && {
                    produkImageUrl: newUpload.url,
                    produkImagePublicId: newUpload.publicId,
                }),
            },
        });

        // 2. Setelah DB berhasil di-update, BARU hapus gambar lama
        if (newUpload && existing.produkImagePublicId) {
            await deleteFromCloudinary(existing.produkImagePublicId);
        }

        return updated;
    } catch (error) {
        // kalau update DB gagal, hapus gambar baru yang sudah terlanjur ke-upload (rollback)
        if (newUpload) {
            await deleteFromCloudinary(newUpload.publicId);
        }
        throw error;
    }
};

export const removeProdukAds = async (id) => {
    const existing = await prisma.produkAds.findUnique({
        where: {
            id,
        },
    });
    if (!existing) throw new Error('Iklan Tidak Ditemukan');

    await prisma.produkAds.delete({ where: { id } });

    // hapus di cloudinary setelah DB berhasil dihapus
    await deleteFromCloudinary(existing.produkImagePublicId);

    return existing;
};
