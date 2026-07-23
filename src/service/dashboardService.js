import prisma from '../config/prisma.js';

export const barang = async () => {
    const [barang, totalBarang] = await prisma.$transaction([
        prisma.barang.findMany({
            include: {
                kategori: true,
            },
        }),
        prisma.barang.count(),
    ]);

    return {
        barang,
        summary: {
            totalBarang,
        },
    };
};

export const stokTipis = async (batas = 15) => {
    const [barang, totalBarang] = await prisma.$transaction([
        prisma.barang.findMany({
            where: {
                jumlahBarang: {
                    lt: batas,
                },
            },
            include: {
                kategori: true,
            },
            orderBy: {
                jumlahBarang: 'asc',
            },
        }),
        prisma.barang.count({
            where: {
                jumlahBarang: {
                    lt: batas,
                },
            },
        }),
    ]);

    return {
        barang,
        summary: {
            totalBarang,
        },
    };
};

const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

export const barangMasukHariIni = async () => {
    const { start, end } = getTodayRange();

    const mutasi = await prisma.mutasiStok.findMany({
        where: {
            tipe: 'Masuk',
            createdAt: {
                gte: start,
                lte: end,
            },
        },
        include: {
            barang: {
                include: {
                    kategori: true,
                },
            },
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const totalTransaksi = mutasi.length;
    const totalJumlahMasuk = mutasi.reduce((acc, m) => acc + m.jumlah, 0);

    return {
        mutasi,
        summary: {
            totalTransaksi,
            totalJumlahMasuk,
        },
    };
};

export const barangKeluarHariIni = async () => {
    const { start, end } = getTodayRange();

    const mutasi = await prisma.mutasiStok.findMany({
        where: {
            tipe: 'Keluar',
            createdAt: {
                gte: start,
                lte: end,
            },
        },
        include: {
            barang: {
                include: {
                    kategori: true,
                },
            },
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const totalTransaksi = mutasi.length;
    const totalJumlahKeluar = mutasi.reduce((acc, m) => acc + m.jumlah, 0);

    return {
        mutasi,
        summary: {
            totalTransaksi,
            totalJumlahKeluar,
        },
    };
};
