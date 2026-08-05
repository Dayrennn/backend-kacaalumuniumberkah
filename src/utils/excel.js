export const buildDateFilter = (startDate, endDate) => {
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

export const formatTanggal = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

export const formatTanggalJam = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const formatRupiah = (angka) => {
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

export const drawTableHeader = (doc, columns, y) => {
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

export const drawTableRow = (doc, columns, row, y, index) => {
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

export const drawTableBorder = (doc, columns, startY, endY) => {
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

export const drawFooter = (doc) => {
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

export const renderLaporan = ({ res, title, subtitle, startDate, endDate, columns, data, filename, summary }) => {
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
