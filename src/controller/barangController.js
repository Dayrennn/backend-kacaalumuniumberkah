import { addBarang, deleteBarang, getAllBarang, getBarangAktif, updateBarang } from '../service/barangService.js';

export const createBarang = async (req, res) => {
    try {
        const { kategoriId, namaBarang, kodeBarang, jumlahBarang, ukuran } = req.body;
        const result = await addBarang({ kategoriId, namaBarang, kodeBarang, jumlahBarang, ukuran });
        res.status(200).json({
            message: 'Berhasil Tambah Data Barang',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeBarangAktif = async (req, res) => {
    try {
        const result = await getBarangAktif();
        res.status(200).json({
            message: 'Berhasil Ambil Data Barang Aktif',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeAllBarang = async (req, res) => {
    try {
        const result = await getAllBarang();
        res.status(200).json({
            message: 'Berhasil Ambil Data Barang',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const modifyBarang = async (req, res) => {
    try {
        const { id } = req.params;
        const { kategoriId, namaBarang, status, ukuran, kodeBarang } = req.body;
        const result = await updateBarang(id, { kategoriId, namaBarang, status, ukuran, kodeBarang });
        res.status(200).json({
            message: 'Berhasil Update Barang',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const removeBarang = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaBarang } = req.body;
        await deleteBarang(id, { namaBarang });
        res.status(200).json({
            message: 'Berhasil Hapus Data',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
