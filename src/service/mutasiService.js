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

    if (barang.status !== 'Aktif') {
        throw new Error('Barang Tidak Aktif, Stok Tidak Bisa Ditambah');
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

export const getAllMutasiMasuk = async ({ startDate, endDate, page = 1, limit = 10 } = {}) => {
    const where = { tipe: 'Masuk' };

    if (startDate || endDate) {
        where.createdAt = {};

        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                throw new Error('Format Start Date Tidak Valid');
            }
            start.setHours(0, 0, 0, 0);
            where.createdAt.gte = start;
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                throw new Error('Format End Date Tidak Valid');
            }
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }

    // Pastikan page & limit berupa angka positif
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Jalankan query data + count total secara paralel biar lebih cepat
    const [result, total] = await Promise.all([
        prisma.mutasiStok.findMany({
            where,
            include: {
                barang: true,
                user: {
                    select: { id: true, username: true, role: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum,
        }),
        prisma.mutasiStok.count({ where }),
    ]);

    return {
        data: result,
        meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
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

export const getAllMutasiKeluar = async ({ startDate, endDate, page = 1, limit = 10 } = {}) => {
    const where = { tipe: 'Keluar' };

    if (startDate || endDate) {
        where.createdAt = {};

        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                throw new Error('Format Start Date Tidak Valid');
            }
            start.setHours(0, 0, 0, 0);
            where.createdAt.gte = start;
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                throw new Error('Format End Date Tidak Valid');
            }
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [result, total] = await Promise.all([
        prisma.mutasiStok.findMany({
            where,
            include: {
                barang: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum,
        }),
        prisma.mutasiStok.count({ where }),
    ]);

    return {
        data: result,
        meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };

    return result;
};
