import { cetakLaporanMasuk, cetakLaporanKeluar, cetakLaporanStokGabungan } from '../service/laporanService.js';

export const printLaporanMasuk = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        await cetakLaporanMasuk(res, { startDate, endDate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const printLaporanKeluar = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        await cetakLaporanKeluar(res, { startDate, endDate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const printLaporanGabungan = async (req, res) => {
    try {
        const { startDate, endDate, judul } = req.query;
        await cetakLaporanStokGabungan(res, { startDate, endDate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
