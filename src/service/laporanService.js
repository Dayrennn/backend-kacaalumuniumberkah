import prisma from '../config/prisma.js';
import PDFDocument from 'pdfkit';

const buildDateFilter = (startDate, endDate) => {
    const where = {};
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
    return where;
};

const formatTanggal = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

const formatTanggalJam = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const formatRupiah = (angka) => {
    if (angka === null || angka === undefined) return '-';
    return `Rp ${Number(angka).toLocaleString('id-ID')}`;
};

// ==== Warna tema ====
const COLOR_PRIMARY = '#1e3a5f';
const COLOR_HEADER_BG = '#1e3a5f';
const COLOR_HEADER_TEXT = '#ffffff';
const COLOR_ROW_EVEN = '#f5f7fa';
const COLOR_ROW_ODD = '#ffffff';
const COLOR_BORDER = '#d0d5dd';
const COLOR_TEXT = '#1a1a1a';
const COLOR_MUTED = '#667085';

const ROW_HEIGHT = 22;
const HEADER_ROW_HEIGHT = 24;

const getTableWidth = (columns) => columns.reduce((sum, col) => sum + col.width, 0);

const drawTableHeader = (doc, columns, y) => {
    const tableWidth = getTableWidth(columns);
    const left = doc.page.margins.left;

    // Background header
    doc.rect(left, y, tableWidth, HEADER_ROW_HEIGHT).fill(COLOR_HEADER_BG);

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_HEADER_TEXT);
    let x = left;
    columns.forEach((col) => {
        doc.text(col.label, x + 5, y + 7, { width: col.width - 10, align: col.align || 'left' });
        x += col.width;
    });

    doc.fillColor(COLOR_TEXT); // reset warna
    return y + HEADER_ROW_HEIGHT;
};

const drawTableRow = (doc, columns, row, y, index) => {
    const tableWidth = getTableWidth(columns);
    const left = doc.page.margins.left;

    // Zebra background
    const bg = index % 2 === 0 ? COLOR_ROW_ODD : COLOR_ROW_EVEN;
    doc.rect(left, y, tableWidth, ROW_HEIGHT).fill(bg);

    // Border bawah baris (garis tipis)
    doc.strokeColor(COLOR_BORDER)
        .lineWidth(0.5)
        .moveTo(left, y + ROW_HEIGHT)
        .lineTo(left + tableWidth, y + ROW_HEIGHT)
        .stroke();

    doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT);
    let x = left;
    columns.forEach((col) => {
        doc.text(String(row[col.key] ?? '-'), x + 5, y + 6, {
            width: col.width - 10,
            align: col.align || 'left',
            ellipsis: true,
        });
        x += col.width;
    });

    return y + ROW_HEIGHT;
};

const drawTableBorder = (doc, columns, startY, endY) => {
    const tableWidth = getTableWidth(columns);
    const left = doc.page.margins.left;

    doc.strokeColor(COLOR_BORDER).lineWidth(0.7);

    // Border luar
    doc.rect(left, startY, tableWidth, endY - startY).stroke();

    // Garis vertikal antar kolom
    let x = left;
    columns.forEach((col, i) => {
        if (i > 0) {
            doc.moveTo(x, startY).lineTo(x, endY).stroke();
        }
        x += col.width;
    });
};

const drawFooter = (doc) => {
    const pageRange = doc.bufferedPageRange();
    for (let i = 0; i < pageRange.count; i++) {
        doc.switchToPage(i);

        const bottom = doc.page.height - doc.page.margins.bottom + 15;
        const left = doc.page.margins.left;
        const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        doc.strokeColor(COLOR_BORDER)
            .lineWidth(0.5)
            .moveTo(left, bottom - 8)
            .lineTo(left + width, bottom - 8)
            .stroke();

        doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_MUTED);
    }
};

const renderLaporan = ({ res, title, subtitle, startDate, endDate, columns, data, filename, summary }) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape', bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ===== Header Laporan (box) =====
    doc.rect(left, doc.y, width, subtitle ? 62 : 48).fill(COLOR_PRIMARY);

    const headerTop = doc.y;
    doc.fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text(title, left + 15, headerTop + 10, {
            width: width - 30,
        });

    if (subtitle) {
        doc.font('Helvetica-Bold')
            .fontSize(11)
            .text(subtitle, left + 15, headerTop + 32, {
                width: width - 30,
            });
    }

    doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#dbe4ee')
        .text(
            `Periode: ${startDate ? formatTanggal(startDate) : 'Semua'}  —  ${endDate ? formatTanggal(endDate) : 'Semua'}`,
            left + 15,
            headerTop + (subtitle ? 46 : 32),
            { width: width - 30 },
        );

    doc.fillColor(COLOR_TEXT);
    doc.y = headerTop + (subtitle ? 62 : 48) + 15;

    // ===== Ringkasan (kalau ada) =====
    if (summary && summary.length > 0) {
        const boxHeight = 40;
        const boxWidth = (width - (summary.length - 1) * 10) / summary.length;
        let sx = left;
        const sy = doc.y;

        summary.forEach((item) => {
            doc.rect(sx, sy, boxWidth, boxHeight).fillAndStroke('#f0f4f8', COLOR_BORDER);
            doc.font('Helvetica')
                .fontSize(7.5)
                .fillColor(COLOR_MUTED)
                .text(item.label, sx + 10, sy + 8, {
                    width: boxWidth - 20,
                });
            doc.font('Helvetica-Bold')
                .fontSize(11)
                .fillColor(COLOR_PRIMARY)
                .text(item.value, sx + 10, sy + 20, {
                    width: boxWidth - 20,
                });
            sx += boxWidth + 10;
        });

        doc.fillColor(COLOR_TEXT);
        doc.y = sy + boxHeight + 15;
    }

    // ===== Tabel =====
    const tableStartX = doc.page.margins.left;
    let y = drawTableHeader(doc, columns, doc.y);
    const tableTopY = doc.y - HEADER_ROW_HEIGHT;
    const bottomLimit = doc.page.height - doc.page.margins.bottom - 25;

    let rowStartY = y;
    let rowIndex = 0;

    data.forEach((row) => {
        if (y + ROW_HEIGHT > bottomLimit) {
            drawTableBorder(doc, columns, rowStartY - HEADER_ROW_HEIGHT, y);
            doc.addPage();
            y = drawTableHeader(doc, columns, doc.page.margins.top);
            rowStartY = y;
            rowIndex = 0;
        }
        y = drawTableRow(doc, columns, row, y, rowIndex);
        rowIndex++;
    });

    if (data.length === 0) {
        doc.font('Helvetica-Oblique')
            .fontSize(10)
            .fillColor(COLOR_MUTED)
            .text('Tidak ada data pada periode ini.', tableStartX + 10, y + 10);
        y += 30;
    }

    drawTableBorder(doc, columns, rowStartY - HEADER_ROW_HEIGHT, y);

    drawFooter(doc);

    doc.end();
};

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
        { key: 'no', label: 'No', width: 28 },
        { key: 'tanggal', label: 'Tanggal', width: 60 },
        { key: 'namaBarang', label: 'Barang', width: 130 },
        { key: 'suplier', label: 'Supplier', width: 110 },
        { key: 'jenisPenjualan', label: 'Jenis', width: 55, align: 'center' },
        { key: 'jumlah', label: 'Jumlah', width: 55, align: 'right' },
        { key: 'stokSebelum', label: 'Stok Sebelum', width: 75, align: 'right' },
        { key: 'stokSesudah', label: 'Stok Sesudah', width: 75, align: 'right' },
        { key: 'user', label: 'Petugas', width: 85 },
        { key: 'keterangan', label: 'Keterangan', width: 100 },
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

    renderLaporan({
        res,
        title: 'Laporan Barang Masuk',
        startDate,
        endDate,
        columns,
        data: rows,
        filename: `laporan-barang-masuk-${Date.now()}.pdf`,
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
        { key: 'no', label: 'No', width: 25 },
        { key: 'tanggal', label: 'Tanggal', width: 58 },
        { key: 'namaBarang', label: 'Barang', width: 110 },
        { key: 'customer', label: 'Customer', width: 90 },
        { key: 'jenisPenjualan', label: 'Jenis', width: 50, align: 'center' },
        { key: 'jumlah', label: 'Jumlah', width: 48, align: 'right' },
        { key: 'stokSebelum', label: 'Stok Sebelum', width: 70, align: 'right' },
        { key: 'stokSesudah', label: 'Stok Sesudah', width: 70, align: 'right' },
        { key: 'totalHarga', label: 'Total Harga', width: 80, align: 'right' },
        { key: 'user', label: 'Petugas', width: 75 },
        { key: 'keterangan', label: 'Keterangan', width: 100 },
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

    renderLaporan({
        res,
        title: 'Laporan Barang Keluar',
        subtitle: `Total Pendapatan: ${formatRupiah(totalPendapatan)}`,
        startDate,
        endDate,
        columns,
        data: rows,
        filename: `laporan-barang-keluar-${Date.now()}.pdf`,
        summary: [
            { label: 'TOTAL TRANSAKSI', value: `${data.length} transaksi` },
            { label: 'TOTAL UNIT KELUAR', value: `${totalUnitKeluar} unit` },
            { label: 'JENIS BARANG', value: `${totalBarangUnik} jenis` },
            { label: 'TOTAL PENDAPATAN', value: formatRupiah(totalPendapatan) },
        ],
    });
};

const formatAngka = (n) => {
    if (n === null || n === undefined) return '';
    return Number(n).toLocaleString('id-ID');
};

const COLOR_HEADER_FILL = '#dce6f1';
const COLOR_GRID = '#000000';

export const cetakLaporanStokGabungan = async (res, { startDate, endDate, judul }) => {
    const dateFilter = buildDateFilter(startDate, endDate);

    const startBoundary = startDate ? new Date(startDate) : null;
    if (startBoundary) startBoundary.setHours(0, 0, 0, 0);

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

    // Hitung Stok Awal/Masuk/Keluar/Stok Akhir per barang, lalu kelompokkan per Nama Barang
    const groups = [];
    let currentGroup = null;

    let totalStokAwal = 0;
    let totalMasuk = 0;
    let totalKeluar = 0;
    let totalStokAkhir = 0;
    let totalNilai = 0;
    let groupCounter = 0;

    for (const barang of semuaBarang) {
        const mutasiPeriode = mutasiByBarang.get(barang.id) || [];

        // Hanya tampilkan barang yang memiliki aktivitas
        // pada periode yang dipilih
        if (mutasiPeriode.length === 0) {
            continue;
        }

        const masuk = mutasiPeriode.filter((m) => m.tipe === 'Masuk').reduce((s, m) => s + m.jumlah, 0);

        const keluar = mutasiPeriode.filter((m) => m.tipe === 'Keluar').reduce((s, m) => s + m.jumlah, 0);

        const stokAwal = mutasiPeriode[0].stokSebelum;

        const stokAkhir = mutasiPeriode[mutasiPeriode.length - 1].stokSesudah;

        const nilaiTotal = stokAkhir * barang.harga;

        const rowData = {
            ukuran: barang.ukuran ?? '-',
            stokAwal,
            masuk,
            keluar,
            stokAkhir,
            harga: barang.harga,
            total: nilaiTotal,
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

        totalStokAwal += stokAwal;
        totalMasuk += masuk;
        totalKeluar += keluar;
        totalStokAkhir += stokAkhir;
        totalNilai += nilaiTotal;
    }

    // ===== Setup dokumen (portrait, meniru ukuran kolom template asli) =====
    const doc = new PDFDocument({ size: 'A4', margin: 36, bufferPages: true });

    const filename = `laporan-stok-gabungan-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const columns = [
        { key: 'no', label: 'NO', width: 25, align: 'center' },
        { key: 'namaBarang', label: 'Nama Barang', width: 95, align: 'left' },
        { key: 'ukuran', label: 'UK Barang', width: 70, align: 'left' },
        { key: 'stokAwal', label: 'Stok Awal', width: 55, align: 'center' },
        { key: 'masuk', label: 'Masuk', width: 50, align: 'center' },
        { key: 'keluar', label: 'Keluar', width: 45, align: 'center' },
        { key: 'stokAkhir', label: 'Stock akhir', width: 58, align: 'center' },
        { key: 'harga', label: 'Harga/L', width: 60, align: 'right' },
        { key: 'total', label: 'Total', width: 65, align: 'right' },
    ];
    const tableWidth = columns.reduce((s, c) => s + c.width, 0);

    const colX = [];
    {
        let x = left;
        columns.forEach((c) => {
            colX.push(x);
            x += c.width;
        });
    }

    // ===== Judul =====
    const judulLaporan = judul ?? 'LAPORAN STOK BARANG';
    const periodeText = startDate
        ? `${formatTanggal(startDate)}${endDate && endDate !== startDate ? ` s/d ${formatTanggal(endDate)}` : ''}`
        : 'SEMUA PERIODE';

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000');
    doc.text(`${judulLaporan.toUpperCase()} ${periodeText}`, left, doc.y, { width, align: 'center' });
    doc.moveDown(0.8);

    // ===== Ringkasan (3 baris teks kiri atas, seperti file asli) =====
    doc.font('Helvetica-Bold').fontSize(9);
    const ringkasanY = doc.y;
    const ringkasan = [
        ['STOK BARANG AWAL', formatAngka(totalStokAwal)],
        ['BARANG MASUK', formatAngka(totalMasuk)],
        ['STOK BARANG AKHIR', formatAngka(totalStokAkhir)],
    ];
    ringkasan.forEach(([label, value], i) => {
        const y = ringkasanY + i * 12;
        doc.text(label, left, y, { continued: false });
        doc.text(value, left + 130, y);
    });
    doc.y = ringkasanY + ringkasan.length * 12 + 8;

    // ===== Helper gambar baris tabel =====
    const HEADER_H = 16;
    const ROW_H = 14;
    const bottomLimit = doc.page.height - doc.page.margins.bottom - 20;

    const drawHeader = (yStart) => {
        let x = left;
        doc.font('Helvetica-Bold').fontSize(7.5);
        columns.forEach((col) => {
            doc.rect(x, yStart, col.width, HEADER_H).fillAndStroke(COLOR_HEADER_FILL, COLOR_GRID);
            doc.fillColor('#000000').text(col.label, x + 3, yStart + 4, {
                width: col.width - 6,
                align: 'center',
            });
            x += col.width;
        });
        return yStart + HEADER_H;
    };

    const drawDataRow = (yStart, rowValues) => {
        let x = left;
        doc.font('Helvetica').fontSize(7.5).fillColor('#000000');
        doc.lineWidth(0.5).strokeColor(COLOR_GRID);
        columns.forEach((col) => {
            doc.rect(x, yStart, col.width, ROW_H).stroke();
            const raw = rowValues[col.key];
            const text = raw === '' || raw === null || raw === undefined ? '' : String(raw);
            if (text !== '') {
                doc.text(text, x + 4, yStart + 3, {
                    width: col.width - 8,
                    align: col.align || 'left',
                    ellipsis: true,
                });
            }
            x += col.width;
        });
        return yStart + ROW_H;
    };

    const ensureSpace = (y, needed) => {
        if (y + needed > bottomLimit) {
            doc.addPage();
            let ny = drawHeader(doc.page.margins.top);
            return ny;
        }
        return y;
    };

    // ===== Header tabel =====
    let y = drawHeader(doc.y);

    // ===== Baris data, dikelompokkan per Nama Barang =====
    groups.forEach((group) => {
        y = ensureSpace(y, ROW_H * group.rows.length);

        group.rows.forEach((row, idx) => {
            y = drawDataRow(y, {
                no: idx === 0 ? group.no : '',
                namaBarang: idx === 0 ? group.namaBarang : '',
                ukuran: row.ukuran,
                stokAwal: formatAngka(row.stokAwal),
                masuk: row.masuk > 0 ? formatAngka(row.masuk) : '',
                keluar: row.keluar > 0 ? formatAngka(row.keluar) : '',
                stokAkhir: formatAngka(row.stokAkhir),
                harga: formatAngka(row.harga),
                total: formatAngka(row.total),
            });
        });

        // baris kosong pemisah antar kelompok (tanpa border, seperti file asli)
        y += ROW_H * 0.6;
    });

    if (groups.length === 0) {
        doc.font('Helvetica-Oblique')
            .fontSize(9)
            .fillColor('#667085')
            .text('Tidak ada data pada periode ini.', left + 5, y + 8);
        y += 24;
    }

    // ===== Total Stok Awal / Stock Akhir polos di bawah tabel (tanpa border) =====
    y = ensureSpace(y, 40);
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    doc.text(formatAngka(totalStokAwal), colX[3], y + 4, { width: columns[3].width, align: 'center' });
    doc.text(formatAngka(totalStokAkhir), colX[6], y + 4, { width: columns[6].width, align: 'center' });
    y += 18;

    // ===== Kotak TOTAL nilai (di bawah kolom Harga/L & Total) =====
    const totalBoxX = colX[7];
    const totalBoxW = columns[7].width + columns[8].width;
    doc.lineWidth(0.7).strokeColor(COLOR_GRID);
    doc.rect(totalBoxX, y, columns[7].width, ROW_H + 2).stroke();
    doc.rect(colX[8], y, columns[8].width, ROW_H + 2).stroke();
    doc.font('Helvetica-Bold').fontSize(8);
    doc.text('TOTAL', totalBoxX + 3, y + 4, { width: columns[7].width - 6, align: 'center' });
    doc.text(formatAngka(totalNilai), colX[8] + 3, y + 4, { width: columns[8].width - 6, align: 'right' });

    doc.end();
};
