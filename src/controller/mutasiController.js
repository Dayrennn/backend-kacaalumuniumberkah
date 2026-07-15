import {
    barangKeluar,
    barangMasuk,
    getAllMutasiKeluar,
    getAllMutasiMasuk,
    getMutasiMasukByBarang,
} from '../service/mutasiService.js';

// barang masuk
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
        return res.status(500).json({ message: error.message });
    }
};

export const seeAllMutasiMasuk = async (req, res) => {
    try {
        const { startDate, endDate, page, limit } = req.query;

        const result = await getAllMutasiMasuk({ startDate, endDate, page, limit });

        return res.status(200).json({
            message: 'Berhasil Mengambil Data Mutasi Masuk',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const seeMutasiMasukByBarang = async (req, res) => {
    try {
        const { barangId } = req.params;

        const result = await getMutasiMasukByBarang(barangId);

        return res.status(200).json({
            message: 'Berhasil Mengambil Data Mutasi Masuk Barang',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// barang keluar
export const addBarangKeluar = async (req, res) => {
    try {
        const { barangId, jumlah, keterangan, ambilDariLembaran, panjangCustom, lebarCustom } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const result = await barangKeluar(
            { barangId, jumlah, keterangan, ambilDariLembaran, panjangCustom, lebarCustom },
            userId,
        );

        return res.status(201).json({
            message: 'Barang Masuk Berhasil Dicatat',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const seeAllMutasiKeluar = async (req, res) => {
    try {
        const { startDate, endDate, page, limit } = req.query;
        const result = await getAllMutasiKeluar({ startDate, endDate, page, limit });

        return res.status(200).json({
            message: 'Berhasil Mengambil Data Mutasi Keluar',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
