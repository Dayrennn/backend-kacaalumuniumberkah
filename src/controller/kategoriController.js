import { addKategori, deleteKategori, getAllKategori, updateKategori } from '../service/kategoriService.js';

export const createKategori = async (req, res) => {
    try {
        const { namaKategori } = req.body;
        const addCategories = await addKategori({ namaKategori });
        res.status(200).json({
            message: 'Berhasil Tambah Kategori',
            data: addCategories,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeAllKategori = async (req, res) => {
    try {
        const result = await getAllKategori();
        res.status(200).json({
            message: 'Berhasil Ambil Data Kategori',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const removeKategori = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaKategori } = req.body;
        await deleteKategori(id, { namaKategori });
        res.status(200).json({
            message: 'Berhasil Menghapus Data',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const modifyKategori = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaKategori, status } = req.body;
        const result = await updateKategori(id, { namaKategori, status });
        res.status(200).json({
            message: 'Berhasil Update Kategori',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
