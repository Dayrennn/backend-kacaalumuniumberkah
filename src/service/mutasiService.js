import prisma from '../config/prisma.js';

// barang masuk
export const barangMasuk = async ({ barangId, jumlah, keterangan }, userId) => {
    if (!barangId) {
        throw new Error('Barang Id Tidak Ditemukan');
    }

    if (!jumlah || jumlah <= 0) {
        throw new Error('Jumlah Harus Lebih Dari 0');
    }

    if (!userId) {
        throw new Error('User Tidak Ditemukan');
    }

    const barang = await prisma.barang.findUnique({
        where: { id: barangId },
    });

    if (!barang) {
        throw new Error('Barang Tidak Ditemukan');
    }

    const stokSebelum = barang.jumlahBarang;
    const stokSesudah = stokSebelum + jumlah;

    const [updatedBarang, mutasi] = await prisma.$transaction([
        prisma.barang.update({
            where: { id: barangId },
            data: { jumlahBarang: stokSesudah },
        }),
        prisma.mutasiStok.create({
            data: {
                barangId,
                userId,
                tipe: 'Masuk',
                jumlah,
                stokSebelum,
                stokSesudah,
                keterangan,
            },
            include: {
                barang: true,
                user: {
                    select: { id: true, username: true, role: true },
                },
            },
        }),
    ]);

    return mutasi;
};

export const getAllMutasiMasuk = async () => {
    const result = await prisma.mutasiStok.findMany({
        where: { tipe: 'Masuk' },
        include: {
            barang: true,
            user: {
                select: { id: true, username: true, role: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return result;
};

export const getMutasiMasukByBarang = async (barangId) => {
    const barang = await prisma.barang.findUnique({
        where: { id: barangId },
    });

    if (!barang) {
        throw new Error('Barang Tidak Ditemukan');
    }

    const result = await prisma.mutasiStok.findMany({
        where: { barangId, tipe: 'Masuk' },
        include: {
            user: {
                select: { id: true, username: true, role: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return result;
};

// barang keluar
export const barangKeluar = async ({ barangId, jumlah, keterangan }, userId) => {
    if (!barangId) {
        throw new Error('Barang Id Tidak Ditemukan');
    }

    if (!jumlah || jumlah <= 0) {
        throw new Error('Jumlah Harus Lebih Dari 0');
    }

    if (!userId) {
        throw new Error('User Tidak Ditemukan');
    }

    const barang = await prisma.barang.findUnique({
        where: { id: barangId },
    });

    if (!barang) {
        throw new Error('Barang Tidak Ditemukan');
    }

    // validasi stok cukup atau tidak
    if (barang.jumlahBarang < jumlah) {
        throw new Error('Stok Barang Tidak Mencukupi');
    }

    const stokSebelum = barang.jumlahBarang;
    const stokSesudah = stokSebelum - jumlah;

    const [updatedBarang, mutasi] = await prisma.$transaction([
        prisma.barang.update({
            where: { id: barangId },
            data: { jumlahBarang: stokSesudah },
        }),
        prisma.mutasiStok.create({
            data: {
                barangId,
                userId,
                tipe: 'Keluar',
                jumlah,
                stokSebelum,
                stokSesudah,
                keterangan,
            },
            include: {
                barang: true,
                user: {
                    select: { id: true, username: true, role: true },
                },
            },
        }),
    ]);

    return mutasi;
};

export const getAllMutasiKeluar = async () => {
    const result = await prisma.mutasiStok.findMany({
        where: { tipe: 'Keluar' },
        include: {
            barang: true,
            user: {
                select: { id: true, username: true, role: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return result;
};
