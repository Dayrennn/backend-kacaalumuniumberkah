import prisma from '../config/prisma.js';

export const addBarang = async ({
    kategoriId,
    namaBarang,
    jumlahBarang,
    status,
    ukuran,
    kodeBarang,
    harga,
    jenisPenjualan,
}) => {
    if (!kategoriId) {
        throw new Error('Kategori Id Tidak Ditemukan');
    }

    if (!namaBarang?.trim()) {
        throw new Error('Nama Barang Wajib Diisi');
    }
    if (!ukuran?.trim()) {
        throw new Error('Ukuran Wajib Diisi');
    }

    if (!harga && harga !== 0) {
        throw new Error('Harga Wajib Diisi');
    }

    // konversi ke float
    const hargaFloat = parseFloat(harga);
    if (isNaN(hargaFloat)) {
        throw new Error('Harga harus berupa angka');
    }

    if (jumlahBarang === undefined || jumlahBarang === null || jumlahBarang === '') {
        throw new Error('Jumlah barang wajib di isi');
    }

    // konversi ke iny
    const jumlahBarangInt = parseInt(jumlahBarang);
    if (isNaN(jumlahBarangInt)) {
        throw new Error('Jumlah barang wajib angka');
    }

    const newBarang = await prisma.barang.create({
        data: {
            kategoriId,
            namaBarang: namaBarang,
            kodeBarang: kodeBarang,
            jumlahBarang: jumlahBarangInt,
            ukuran: ukuran,
            harga: hargaFloat,
            ...(jenisPenjualan && { jenisPenjualan }),
            ...(status && { status }),
        },
    });

    return newBarang;
};

export const getBarangAktif = async () => {
    const barangAktif = await prisma.barang.findMany({
        where: {
            status: 'Aktif',
        },
        include: {
            kategori: true,
        },
    });

    return barangAktif;
};

export const getAllBarang = async () => {
    const [barang, totalBarang, barangAktif, barangNonaktif] = await prisma.$transaction([
        prisma.barang.findMany({
            include: {
                kategori: true,
            },
        }),
        prisma.barang.count(),
        prisma.barang.count({
            where: {
                status: 'Aktif',
            },
        }),
        prisma.barang.count({
            where: {
                status: 'Nonaktif',
            },
        }),
    ]);
    return {
        barang,
        summary: {
            totalBarang,
            barangAktif,
            barangNonaktif,
        },
    };
};

export const updateBarang = async (id, { kategoriId, namaBarang, status, ukuran, kodeBarang }) => {
    const existingBarang = await prisma.barang.findUnique({
        where: { id },
    });

    if (!existingBarang) {
        throw new Error('Barang Tidak Ditemukan');
    }

    // if (namaBarang) {
    //     const existing = await prisma.barang.findFirst({
    //         where: { namaBarang, kategoriId: kategoriId ?? existingBarang.kategoriId, NOT: { id } },
    //     });
    //     if (existing) {
    //         throw new Error('Nama Barang Sudah Digunakan');
    //     }
    // }

    const data = {};
    if (namaBarang) {
        data.namaBarang = namaBarang;
    }
    if (kategoriId) {
        data.kategoriId = kategoriId;
    }
    if (status) {
        data.status = status;
    }
    if (ukuran) {
        data.ukuran = ukuran;
    }
    if (kodeBarang !== undefined) {
        data.kodeBarang = kodeBarang;
    }

    const update = await prisma.barang.update({
        where: { id },
        data,
        include: {
            kategori: true,
        },
    });

    return update;
};

export const deleteBarang = async (id, { namaBarang }) => {
    const existingBarang = await prisma.barang.findUnique({
        where: { id },
    });

    if (!existingBarang) {
        throw new Error('Barang Tidak Ditemukan');
    }

    if (existingBarang.namaBarang !== namaBarang) {
        throw new Error('Nama Barang Tidak Sesuai');
    }

    const remove = await prisma.barang.delete({
        where: { id },
    });

    return remove;
};

export const getBarangPotongan = async () => {
    const potongan = await prisma.barang.findFirst({
        where: {
            jenisPenjualan: 'Potongan',
        },
        include: {
            kategori: true,
            mutasi: true,
        },
    });

    return potongan;
};
