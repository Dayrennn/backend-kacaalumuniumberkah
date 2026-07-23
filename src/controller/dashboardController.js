import { barang, barangKeluarHariIni, barangMasukHariIni, stokTipis } from '../service/dashboardService.js';

export const totalBarang = async (req, res) => {
    try {
        const result = await barang();
        res.status(200).json({
            message: 'Berhasil Ambil Total Data Barang',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const barangTipis = async (req, res) => {
    try {
        const result = await stokTipis();
        res.status(200).json({
            message: 'Berhasil Ambil Total Data Barang Tipis',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const barangKeluarToday = async (req, res) => {
    try {
        const result = await barangKeluarHariIni();
        res.status(200).json({
            message: 'Berhasil Ambil Data keluar Hari Ini',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const barangMasukToday = async (req, res) => {
    try {
        const result = await barangMasukHariIni();
        res.status(200).json({
            message: 'Berhasil Ambil Data Masuk Hari Ini',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
