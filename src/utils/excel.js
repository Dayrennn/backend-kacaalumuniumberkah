import ExcelJS from 'exceljs';

export const buildDateFilter = (startDate, endDate) => {
    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            const [y, m, d] = startDate.split('-').map(Number);
            if (!y || !m || !d) throw new Error('Format Start Date Tidak Valid');
            where.createdAt.gte = new Date(y, m - 1, d, 0, 0, 0, 0);
        }
        if (endDate) {
            const [y, m, d] = endDate.split('-').map(Number);
            if (!y || !m || !d) throw new Error('Format End Date Tidak Valid');
            where.createdAt.lte = new Date(y, m - 1, d, 23, 59, 59, 999);
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
const COLOR_PRIMARY = 'FF1E3A5F';
const COLOR_HEADER_TEXT = 'FFFFFFFF';
const COLOR_ROW_EVEN = 'FFF5F7FA';
const COLOR_BORDER = 'FFD0D5DD';
const COLOR_SUMMARY_BG = 'FFF0F4F8';
const COLOR_SUMMARY_LABEL = 'FF667085';

const thinBorder = {
    top: { style: 'thin', color: { argb: COLOR_BORDER } },
    left: { style: 'thin', color: { argb: COLOR_BORDER } },
    bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
    right: { style: 'thin', color: { argb: COLOR_BORDER } },
};

const sendWorkbook = async (res, workbook, filename) => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
};

/**
 * Renderer generik untuk laporan berbentuk tabel transaksi datar
 * (dipakai oleh Laporan Masuk & Laporan Keluar).
 */
export const renderLaporanExcel = async ({
    res,
    title,
    subtitle,
    startDate,
    endDate,
    columns,
    data,
    filename,
    summary,
}) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan', { views: [{ showGridLines: false }] });

    const colCount = columns.length;
    columns.forEach((col, i) => {
        sheet.getColumn(i + 1).width = col.excelWidth ?? Math.max(10, Math.round(col.width / 6));
    });

    let row = 1;

    sheet.mergeCells(row, 1, row, colCount);
    const titleCell = sheet.getCell(row, 1);
    titleCell.value = title;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: COLOR_HEADER_TEXT } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
    sheet.getRow(row).height = 26;
    row++;

    if (subtitle) {
        sheet.mergeCells(row, 1, row, colCount);
        const subtitleCell = sheet.getCell(row, 1);
        subtitleCell.value = subtitle;
        subtitleCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_HEADER_TEXT } };
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
        row++;
    }

    sheet.mergeCells(row, 1, row, colCount);
    const periodeCell = sheet.getCell(row, 1);
    periodeCell.value = `Periode: ${startDate ? formatTanggal(startDate) : 'Semua'}  -  ${endDate ? formatTanggal(endDate) : 'Semua'}`;
    periodeCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: COLOR_HEADER_TEXT } };
    periodeCell.alignment = { horizontal: 'center' };
    periodeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
    row += 2;

    if (summary && summary.length > 0) {
        const labelRow = row;
        const valueRow = row + 1;
        const spanPerItem = Math.max(1, Math.floor(colCount / summary.length));

        summary.forEach((item, i) => {
            const startCol = i * spanPerItem + 1;
            const endCol = i === summary.length - 1 ? colCount : startCol + spanPerItem - 1;

            sheet.mergeCells(labelRow, startCol, labelRow, endCol);
            const labelCell = sheet.getCell(labelRow, startCol);
            labelCell.value = item.label;
            labelCell.font = { name: 'Calibri', size: 8, color: { argb: COLOR_SUMMARY_LABEL } };
            labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SUMMARY_BG } };
            labelCell.alignment = { horizontal: 'center' };

            sheet.mergeCells(valueRow, startCol, valueRow, endCol);
            const valueCell = sheet.getCell(valueRow, startCol);
            valueCell.value = item.value;
            valueCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_PRIMARY } };
            valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SUMMARY_BG } };
            valueCell.alignment = { horizontal: 'center' };
        });

        row = valueRow + 2;
    }

    const headerRow = row;
    columns.forEach((col, i) => {
        const cell = sheet.getCell(headerRow, i + 1);
        cell.value = col.label;
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_HEADER_TEXT } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = thinBorder;
    });
    sheet.getRow(headerRow).height = 20;
    row++;

    data.forEach((rowData, idx) => {
        columns.forEach((col, i) => {
            const cell = sheet.getCell(row, i + 1);
            cell.value = rowData[col.key] ?? '-';
            cell.font = { name: 'Calibri', size: 10 };
            cell.alignment = { horizontal: col.align || 'left', vertical: 'middle' };
            cell.border = thinBorder;
            if (idx % 2 === 1) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ROW_EVEN } };
            }
        });
        row++;
    });

    if (data.length === 0) {
        sheet.mergeCells(row, 1, row, colCount);
        const emptyCell = sheet.getCell(row, 1);
        emptyCell.value = 'Tidak ada data pada periode ini.';
        emptyCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: COLOR_SUMMARY_LABEL } };
        emptyCell.alignment = { horizontal: 'center' };
    }

    await sendWorkbook(res, workbook, filename);
};

/**
 * Renderer khusus Laporan Stok Gabungan, mengikuti persis format
 * template "STOK KACA LEGOK" (NO, Nama Barang, UK Barang, Stok Awal,
 * Masuk, Keluar, Stock Akhir, Harga/L, Total) dengan grup per nama barang
 * dan formula (bukan angka statis).
 */
export const renderLaporanStokGabunganExcel = async ({ res, judul, startDate, endDate, groups, filename }) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Stok Gabungan', { views: [{ showGridLines: false }] });

    const COLOR_HEADER_BG = 'FFDCE6F1';
    const COLOR_GRID = 'FF000000';
    const gridBorder = {
        top: { style: 'thin', color: { argb: COLOR_GRID } },
        left: { style: 'thin', color: { argb: COLOR_GRID } },
        bottom: { style: 'thin', color: { argb: COLOR_GRID } },
        right: { style: 'thin', color: { argb: COLOR_GRID } },
    };

    const columns = [
        { key: 'no', label: 'NO', width: 6, align: 'center' },
        { key: 'namaBarang', label: 'Nama Barang', width: 18, align: 'left' },
        { key: 'ukuran', label: 'UK Barang', width: 13, align: 'center' },
        { key: 'stokAwal', label: 'Stok Awal', width: 11, align: 'center' },
        { key: 'masuk', label: 'Masuk', width: 10, align: 'center' },
        { key: 'keluar', label: 'Keluar', width: 10, align: 'center' },
        { key: 'stokAkhir', label: 'Stock akhir', width: 11, align: 'center' },
        { key: 'harga', label: 'Harga/L', width: 12, align: 'right' },
        { key: 'total', label: 'Total', width: 14, align: 'right' },
    ];
    columns.forEach((c, i) => {
        sheet.getColumn(i + 1).width = c.width;
    });

    const periodeText = startDate
        ? `${formatTanggal(startDate)}${endDate && endDate !== startDate ? ` s/d ${formatTanggal(endDate)}` : ''}`
        : 'SEMUA PERIODE';
    const judulLaporan = judul ?? 'LAPORAN STOK BARANG';

    // ===== Judul (2 baris, seperti template) =====
    sheet.mergeCells(1, 1, 2, columns.length);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = `${judulLaporan.toUpperCase()} ${periodeText}`;
    titleCell.font = { name: 'Calibri', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // ===== Ringkasan (STOK AWAL / MASUK / AKHIR) — nilainya formula, diisi belakangan =====
    sheet.getCell(3, 1).value = 'STOK BARANG AWAL';
    sheet.getCell(3, 1).font = { name: 'Calibri', size: 11, bold: true };
    sheet.getCell(4, 1).value = 'BARANG MASUK';
    sheet.getCell(4, 1).font = { name: 'Calibri', size: 11, bold: true };
    sheet.getCell(5, 1).value = 'STOK BARANG AKHIR';
    sheet.getCell(5, 1).font = { name: 'Calibri', size: 11, bold: true };

    // ===== Header tabel (baris 6) =====
    const headerRowIdx = 6;
    columns.forEach((col, i) => {
        const cell = sheet.getCell(headerRowIdx, i + 1);
        cell.value = col.label;
        cell.font = { name: 'Calibri', size: 9.5, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_BG } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = gridBorder;
    });

    // ===== Baris data, dikelompokkan per Nama Barang (mengikuti pola template) =====
    let r = headerRowIdx + 2; // baris 7 kosong seperti template asli, data mulai baris 8
    const firstDataRow = r;

    if (groups.length === 0) {
        sheet.mergeCells(r, 1, r, columns.length);
        const emptyCell = sheet.getCell(r, 1);
        emptyCell.value = 'Tidak ada data pada periode ini.';
        emptyCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: COLOR_SUMMARY_LABEL } };
        emptyCell.alignment = { horizontal: 'center' };
        r++;
    }

    groups.forEach((group) => {
        group.rows.forEach((rowData, idx) => {
            columns.forEach((col, colIdx) => {
                const cell = sheet.getCell(r, colIdx + 1);
                cell.border = gridBorder;
                cell.font = { name: 'Calibri', size: 9.5 };
                cell.alignment = { horizontal: col.align || 'left', vertical: 'middle' };

                if (col.key === 'no') {
                    cell.value = idx === 0 ? group.no : null;
                } else if (col.key === 'namaBarang') {
                    cell.value = idx === 0 ? group.namaBarang : null;
                } else if (col.key === 'total') {
                    cell.value = { formula: `G${r}*H${r}` };
                    cell.numFmt = '#,##0';
                } else if (col.key === 'harga') {
                    cell.value = rowData.harga;
                    cell.numFmt = '#,##0';
                } else {
                    cell.value = rowData[col.key] ?? null;
                }
            });
            r++;
        });
        r++; // baris pemisah antar grup (tanpa border), seperti template
    });

    const lastDataRow = groups.length === 0 ? firstDataRow : r - 2;
    const totalRow = groups.length === 0 ? r + 1 : r;

    if (groups.length > 0) {
        sheet.getCell(totalRow, 4).value = { formula: `SUM(D${firstDataRow}:D${lastDataRow})` };
        sheet.getCell(totalRow, 4).numFmt = '#,##0';
        sheet.getCell(totalRow, 4).font = { name: 'Calibri', size: 9.5 };
        sheet.getCell(totalRow, 4).alignment = { horizontal: 'center' };

        sheet.getCell(totalRow, 7).value = { formula: `SUM(G${firstDataRow}:G${lastDataRow})` };
        sheet.getCell(totalRow, 7).numFmt = '#,##0';
        sheet.getCell(totalRow, 7).font = { name: 'Calibri', size: 9.5 };
        sheet.getCell(totalRow, 7).alignment = { horizontal: 'center' };

        sheet.getCell(3, 9).value = { formula: `D${totalRow}` };
        sheet.getCell(4, 9).value = { formula: `SUM(E${firstDataRow}:E${lastDataRow})` };
        sheet.getCell(5, 9).value = { formula: `G${totalRow}` };
    } else {
        sheet.getCell(3, 9).value = 0;
        sheet.getCell(4, 9).value = 0;
        sheet.getCell(5, 9).value = 0;
    }
    [3, 4, 5].forEach((rr) => {
        sheet.getCell(rr, 9).numFmt = '#,##0';
        sheet.getCell(rr, 9).font = { name: 'Calibri', size: 9, bold: true };
    });

    // ===== Kotak TOTAL nilai =====
    const totalLabelRow = totalRow + 1;
    sheet.getCell(totalLabelRow, 8).value = 'TOTAL';
    sheet.getCell(totalLabelRow, 8).font = { name: 'Calibri', size: 10, bold: true };
    sheet.getCell(totalLabelRow, 8).alignment = { horizontal: 'center' };
    sheet.getCell(totalLabelRow, 8).border = gridBorder;

    sheet.getCell(totalLabelRow, 9).value = groups.length > 0 ? { formula: `SUM(I${firstDataRow}:I${totalRow})` } : 0;
    sheet.getCell(totalLabelRow, 9).numFmt = '#,##0';
    sheet.getCell(totalLabelRow, 9).font = { name: 'Calibri', size: 10, bold: true };
    sheet.getCell(totalLabelRow, 9).alignment = { horizontal: 'right' };
    sheet.getCell(totalLabelRow, 9).border = gridBorder;

    await sendWorkbook(res, workbook, filename);
};
