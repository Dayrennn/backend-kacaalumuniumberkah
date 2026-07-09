import prisma from '../config/prisma.js';

export const addProdukAds = async ({ barangId, deskripsi, produkImageUrl }) => {
    if (!barangId) throw new Error('Barang Tidak Tersedia');
    if (!produkImageUrl) throw new Error('Gambar Wajib di Upload');

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

    const newAds = await prisma.produkAds.create({
        data: {
            barangId,
            deskripsi,
            produkImageUrl,
        },
    });

    return newAds;
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
