/**
 * Menghitung total harga transaksi berdasarkan jenis penjualan barang.
 *
 * PCS      -> totalHarga = harga * jumlah
 * Potongan -> hargaPerPotong = (panjangCustom * lebarCustom * harga) / 10000
 *             totalHarga     = hargaPerPotong * jumlah
 *
 * @param {object} barang - record barang dari prisma (harus punya field harga & jenisPenjualan)
 * @param {object} opts
 * @param {number} opts.jumlah - jumlah pcs / jumlah potongan yang dibeli
 * @param {number} [opts.panjangCustom] - dalam cm, wajib kalau Potongan
 * @param {number} [opts.lebarCustom] - dalam cm, wajib kalau Potongan
 * @returns {{ totalHarga: number, hargaPerUnit: number }}
 */
export const hitungTotalHarga = (barang, { jumlah, panjangCustom, lebarCustom }) => {
    if (barang.jenisPenjualan === 'Potongan') {
        if (!panjangCustom || panjangCustom <= 0) {
            throw new Error('Panjang Custom Wajib Diisi Dan Lebih Dari 0 (cm)');
        }
        if (!lebarCustom || lebarCustom <= 0) {
            throw new Error('Lebar Custom Wajib Diisi Dan Lebih Dari 0 (cm)');
        }

        const hargaPerUnit = (panjangCustom * lebarCustom * barang.harga) / 10000;
        const totalHarga = hargaPerUnit * jumlah;

        return {
            hargaPerUnit: Math.round(hargaPerUnit),
            totalHarga: Math.round(totalHarga),
        };
    }

    // default: PCS
    const totalHarga = barang.harga * jumlah;
    return {
        hargaPerUnit: barang.harga,
        totalHarga: Math.round(totalHarga),
    };
};
