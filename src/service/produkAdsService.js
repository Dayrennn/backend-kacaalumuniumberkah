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

export const updateProdukAds = async (id, { barangId, deskripsi, produkImageUrl }) => {
    const existingAds = await prisma.produkAds.findUnique({
        where: { id },
    });

    if (!existingAds) {
        throw new Error('Ads tidak ditemukan');
    }

    // Kalau barangId diganti, pastikan barang tujuan valid & belum punya ads lain
    if (barangId && barangId !== existingAds.barangId) {
        const barang = await prisma.barang.findUnique({
            where: { id: barangId },
            select: { id: true },
        });
        if (!barang) throw new Error('Barang Tidak Ditemukan');

        const adsLain = await prisma.produkAds.findFirst({
            where: { barangId, NOT: { id } },
            select: { id: true },
        });
        if (adsLain) throw new Error('Barang ini sudah punya iklan lain');
    }

    const data = {};
    if (barangId && barangId !== existingAds.barangId) data.barangId = barangId;
    if (deskripsi !== undefined && deskripsi !== existingAds.deskripsi) data.deskripsi = deskripsi;
    if (produkImageUrl && produkImageUrl !== existingAds.produkImageUrl) {
        data.produkImageUrl = produkImageUrl;
    }

    if (Object.keys(data).length === 0) {
        return existingAds;
    }

    const updateAds = await prisma.produkAds.update({
        where: { id },
        data,
    });

    // kembalikan juga path gambar lama, supaya controller tahu file mana yang harus dihapus
    return {
        ...updateAds,
        oldImageUrl: data.produkImageUrl ? existingAds.produkImageUrl : null,
    };
};

export const deleteProdukAds = async (id) => {
    const existingAds = await prisma.produkAds.findUnique({
        where: { id },
    });

    if (!existingAds) {
        throw new Error('Iklan tidak ditemukan');
    }

    const remove = await prisma.produkAds.delete({
        where: { id },
    });

    return remove;
};
