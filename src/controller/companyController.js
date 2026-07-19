import { addCompany, getAdsLandingPage, getCompanyProfile } from '../service/companyService.js';

export const seeAllAds = async (req, res) => {
    try {
        const result = await getAdsLandingPage();
        res.status(200).json({
            message: 'Berhasil Ambil Data Kategori Untuk Landing Page',
            result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const createCompany = async (req, res) => {
    try {
        const { namaPerusahaan, telephone, deskripsiPerusahaan, lokasi, jadwal, email } = req.body;
        const data = await addCompany({ namaPerusahaan, telephone, deskripsiPerusahaan, lokasi, jadwal, email });
        res.status(200).json({
            message: 'Berhasil Tambah Data Perusahaan',
            data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeAllCompany = async (req, res) => {
    try {
        const data = await getCompanyProfile();
        res.status(200).json({
            message: 'Berhasil Mengambil Data Profile Perusahaan',
            data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
