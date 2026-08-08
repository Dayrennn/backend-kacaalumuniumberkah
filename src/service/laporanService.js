import prisma from '../config/prisma.js';
import {
    buildDateFilter,
    formatTanggal,
    formatTanggalJam,
    formatRupiah,
    renderLaporanExcel,
    renderLaporanStokGabunganExcel,
} from '../utils/excel.js';

export const cetakLaporanMasuk = async (res, { startDate, endDate }) => {
    const where = buildDateFilter(startDate, endDate);
    where.tipe = 'Masuk';

    const data = await prisma.mutasiStok.findMany({
        where,
        include: {
            barang: true,
            user: { select: { username: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    const columns = [
        { key: 'no', label: 'No', excelWidth: 5 },
        { key: 'tanggal', label: 'Tanggal', excelWidth: 12 },
        { key: 'namaBarang', label: 'Barang', excelWidth: 22 },
        { key: 'suplier', label: 'Supplier', excelWidth: 18 },
        { key: 'jenisPenjualan', label: 'Jenis', excelWidth: 10, align: 'center' },
        { key: 'jumlah', label: 'Jumlah', excelWidth: 10, align: 'right' },
        { key: 'stokSebelum', label: 'Stok Sebelum', excelWidth: 12, align: 'right' },
        { key: 'stokSesudah', label: 'Stok Sesudah', excelWidth: 12, align: 'right' },
        { key: 'user', label: 'Petugas', excelWidth: 14 },
        { key: 'keterangan', label: 'Keterangan', excelWidth: 20 },
    ];

    const rows = data.map((m, i) => ({
        no: i + 1,
        tanggal: formatTanggal(m.createdAt),
        namaBarang: m.barang?.namaBarang ?? '-',
        suplier: m.suplier ?? '-',
        jenisPenjualan: m.barang?.jenisPenjualan ?? '-',
        jumlah: m.jumlah,
        stokSebelum: m.stokSebelum,
        stokSesudah: m.stokSesudah,
        user: m.user?.username ?? '-',
        keterangan: m.keterangan ?? '-',
    }));

    const totalUnitMasuk = data.reduce((sum, m) => sum + m.jumlah, 0);
    const totalBarangUnik = new Set(data.map((m) => m.barangId)).size;

    await renderLaporanExcel({
        res,
        title: 'Laporan Barang Masuk',
        startDate,
        endDate,
        columns,
        data: rows,
        filename: `laporan-barang-masuk-${Date.now()}.xlsx`,
        summary: [
            { label: 'TOTAL TRANSAKSI', value: `${data.length} transaksi` },
            { label: 'TOTAL UNIT MASUK', value: `${totalUnitMasuk} unit` },
            { label: 'JENIS BARANG', value: `${totalBarangUnik} jenis` },
        ],
    });
};

export const cetakLaporanKeluar = async (res, { startDate, endDate }) => {
    const where = buildDateFilter(startDate, endDate);
    where.tipe = 'Keluar';

    const data = await prisma.mutasiStok.findMany({
        where,
        include: {
            barang: true,
            user: { select: { username: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    const columns = [
        { key: 'no', label: 'No', excelWidth: 5 },
        { key: 'tanggal', label: 'Tanggal', excelWidth: 12 },
        { key: 'namaBarang', label: 'Barang', excelWidth: 20 },
        { key: 'customer', label: 'Customer', excelWidth: 16 },
        { key: 'jenisPenjualan', label: 'Jenis', excelWidth: 10, align: 'center' },
        { key: 'jumlah', label: 'Jumlah', excelWidth: 9, align: 'right' },
        { key: 'stokSebelum', label: 'Stok Sebelum', excelWidth: 12, align: 'right' },
        { key: 'stokSesudah', label: 'Stok Sesudah', excelWidth: 12, align: 'right' },
        { key: 'totalHarga', label: 'Total Harga', excelWidth: 15, align: 'right' },
        { key: 'user', label: 'Petugas', excelWidth: 14 },
        { key: 'keterangan', label: 'Keterangan', excelWidth: 20 },
    ];

    const rows = data.map((m, i) => ({
        no: i + 1,
        tanggal: formatTanggal(m.createdAt),
        namaBarang: m.barang?.namaBarang ?? '-',
        customer: m.customer ?? '-',
        jenisPenjualan: m.barang?.jenisPenjualan ?? '-',
        jumlah: m.jumlah,
        stokSebelum: m.stokSebelum,
        stokSesudah: m.stokSesudah,
        totalHarga: formatRupiah(m.totalHarga),
        user: m.user?.username ?? '-',
        keterangan: m.keterangan ?? '-',
    }));

    const totalPendapatan = data.reduce((sum, m) => sum + (m.totalHarga ?? 0), 0);
    const totalUnitKeluar = data.reduce((sum, m) => sum + m.jumlah, 0);
    const totalBarangUnik = new Set(data.map((m) => m.barangId)).size;

    await renderLaporanExcel({
        res,
        title: 'Laporan Barang Keluar',
        subtitle: `Total Pendapatan: ${formatRupiah(totalPendapatan)}`,
        startDate,
        endDate,
        columns,
        data: rows,
        filename: `laporan-barang-keluar-${Date.now()}.xlsx`,
        summary: [
            { label: 'TOTAL TRANSAKSI', value: `${data.length} transaksi` },
            { label: 'TOTAL UNIT KELUAR', value: `${totalUnitKeluar} unit` },
            { label: 'JENIS BARANG', value: `${totalBarangUnik} jenis` },
            { label: 'TOTAL PENDAPATAN', value: formatRupiah(totalPendapatan) },
        ],
    });
};

export const cetakLaporanStokGabungan = async (res, { startDate, endDate, judul }) => {
    const dateFilter = buildDateFilter(startDate, endDate);

    // Ambil semua barang, urut per kategori -> nama barang -> ukuran
    const semuaBarang = await prisma.barang.findMany({
        include: { kategori: true },
        orderBy: [{ kategori: { namaKategori: 'asc' } }, { namaBarang: 'asc' }, { ukuran: 'asc' }],
    });

    // Ambil semua mutasi dalam periode sekaligus (hindari N+1 di kasus umum)
    const semuaMutasiPeriode = semuaBarang.length
        ? await prisma.mutasiStok.findMany({
              where: {
                  barangId: { in: semuaBarang.map((b) => b.id) },
                  ...dateFilter,
              },
              orderBy: { createdAt: 'asc' },
          })
        : [];

    const mutasiByBarang = new Map();
    semuaMutasiPeriode.forEach((m) => {
        if (!mutasiByBarang.has(m.barangId)) mutasiByBarang.set(m.barangId, []);
        mutasiByBarang.get(m.barangId).push(m);
    });

    // Helper: bangun "groups" (grouping per namaBarang) dari sebuah list barang.
    // Dipakai terpisah untuk kelompok PCS dan kelompok Potongan.
    const buildGroups = (listBarang) => {
        const groups = [];
        let currentGroup = null;
        let groupCounter = 0;

        for (const barang of listBarang) {
            const mutasiPeriode = mutasiByBarang.get(barang.id) || [];

            if (mutasiPeriode.length === 0) continue;

            const masuk = mutasiPeriode.filter((m) => m.tipe === 'Masuk').reduce((s, m) => s + m.jumlah, 0);
            const keluar = mutasiPeriode.filter((m) => m.tipe === 'Keluar').reduce((s, m) => s + m.jumlah, 0);

            // Jumlahkan totalHarga dari mutasi Masuk (harga beli yang diinput manual
            // saat input barang masuk). Mutasi Masuk yang totalHarga-nya null (tidak
            // diisi) tidak ikut dijumlahkan.
            const hargaBeli = mutasiPeriode
                .filter((m) => m.tipe === 'Masuk' && m.totalHarga !== null && m.totalHarga !== undefined)
                .reduce((s, m) => s + m.totalHarga, 0);

            const stokAwal = mutasiPeriode[0].stokSebelum;
            const stokAkhir = mutasiPeriode[mutasiPeriode.length - 1].stokSesudah;

            const rowData = {
                ukuran: barang.ukuran ?? '-',
                stokAwal,
                masuk,
                keluar,
                stokAkhir,
                harga: barang.harga,
                hargaBeli,
            };

            if (currentGroup && currentGroup.namaBarang === barang.namaBarang) {
                currentGroup.rows.push(rowData);
            } else {
                groupCounter++;
                currentGroup = {
                    no: groupCounter,
                    namaBarang: barang.namaBarang,
                    rows: [rowData],
                };
                groups.push(currentGroup);
            }
        }

        return groups;
    };

    // Pisah barang jadi 2 kelompok besar berdasarkan jenisPenjualan
    const barangPCS = semuaBarang.filter((b) => b.jenisPenjualan === 'PCS');
    const barangPotongan = semuaBarang.filter((b) => b.jenisPenjualan === 'Potongan');

    const groupsPCS = buildGroups(barangPCS);
    const groupsPotongan = buildGroups(barangPotongan);

    await renderLaporanStokGabunganExcel({
        res,
        judul: judul ?? 'LAPORAN STOK BARANG',
        startDate,
        endDate,
        sections: [
            { title: 'BARANG PCS', groups: groupsPCS },
            { title: 'BARANG POTONGAN', groups: groupsPotongan },
        ],
        filename: `laporan-stok-gabungan-${Date.now()}.xlsx`,
    });
};
