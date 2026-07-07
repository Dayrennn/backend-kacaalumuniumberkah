//import { barangMasuk, getAllMutasiMasuk, getMutasiMasukByBarang } from '../services/mutasiStok.service.js';
import { barangMasuk, getAllMutasiMasuk, getMutasiMasukByBarang } from '../service/mutasiService.js';

export const addBarangMasuk = async (req, res) => {
    try {
        const { barangId, jumlah, keterangan } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const result = await barangMasuk({ barangId, jumlah, keterangan }, userId);

        return res.status(201).json({
            message: 'Barang Masuk Berhasil Dicatat',
            data: result,
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

export const seeAllMutasiMasuk = async (req, res) => {
    try {
        const result = await getAllMutasiMasuk();

        return res.status(200).json({
            message: 'Berhasil Mengambil Data Mutasi Masuk',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const handleGetMutasiMasukByBarang = async (req, res) => {
    try {
        const { barangId } = req.params;

        const result = await getMutasiMasukByBarang(barangId);

        return res.status(200).json({
            message: 'Berhasil Mengambil Data Mutasi Masuk Barang',
            data: result,
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
