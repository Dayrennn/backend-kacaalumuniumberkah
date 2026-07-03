import prisma from '../config/prisma.js';

export const addKategori = async ({ namaKategori, status }) => {
    if (!namaKategori?.trim()) {
        throw new Error('Nama Kategori Wajib di isi');
    }

    const existingKategori = await prisma.kategori.findFirst({
        where: {
            namaKategori,
        },
    });

    if (existingKategori) {
        throw new Error('Nama Kategori Sudah Ada');
    }

    const newKategori = await prisma.kategori.create({
        data: {
            namaKategori: namaKategori,
            ...(status && { status }),
        },
    });

    return newKategori;
};

export const getAllKategori = async () => {
    const [kategori, totalKategori, totalKategoriAktif, totalKategoriNonaktif] = await prisma.$transaction([
        prisma.kategori.findMany({
            select: {
                id: true,
                namaKategori: true,
                status: true,
            },
        }),
        prisma.kategori.count(),
        prisma.kategori.count({
            where: {
                status: 'Aktif',
            },
        }),
        prisma.kategori.count({
            where: {
                status: 'Nonaktif',
            },
        }),
    ]);
    return {
        kategori,
        summary: {
            totalKategori,
            totalKategoriAktif,
            totalKategoriNonaktif,
        },
    };
};

export const updateKategori = async (id, { namaKategori, status }) => {
    const existingKategori = await prisma.kategori.findUnique({
        where: { id },
    });

    if (!existingKategori) {
        throw new Error('Kategori Tidak Ditemukan');
    }

    const data = {};
    if (namaKategori) {
        data.namaKategori = namaKategori;
    }
    if (status) {
        data.status = status;
    }

    const update = await prisma.kategori.update({
        where: { id },
        data,
        select: {
            id: true,
            namaKategori: true,
            status: true,
        },
    });

    return update;
};

export const deleteKategori = async (id, { namaKategori }) => {
    // 1. Ambil data asli berdasarkan ID yang mau dihapus
    const existingKategori = await prisma.kategori.findUnique({
        where: { id },
    });

    if (!existingKategori) {
        throw new Error('Kategori Tidak Ditemukan');
    }

    // 2. Cocokkan nama yang diketik user dengan nama asli
    if (existingKategori.namaKategori !== namaKategori) {
        throw new Error('Nama Kategori Tidak Sesuai');
    }

    // 3. Baru hapus berdasarkan ID (unique field)
    const remove = await prisma.kategori.delete({
        where: { id },
    });

    return remove;
};