import { addBanner, addCompany, getAdsLandingPage, getBanner, getCompanyProfile } from '../service/companyService.js';
import compressToWebp from '../utils/compressWebp.js';
import path from 'path';
import fs from 'fs';

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

export const createBanner = async (req, res) => {
    let imagePath = null;

    try {
        const { judul } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ message: 'Gambar Wajib di Upload' });
        }

        imagePath = await compressToWebp(image.buffer, `banner-${judul}`);

        const newBanner = await addBanner({
            bannerImageUrl: imagePath,
            judul,
        });

        // hapus banner lama HANYA kalau upsert berhasil dan memang ada banner lama yang digantikan
        if (newBanner.oldImageUrl) {
            const oldFilePath = path.join(process.cwd(), newBanner.oldImageUrl);
            fs.unlink(oldFilePath, (err) => {
                if (err) console.error('Gagal hapus banner lama:', err.message);
            });
        }

        return res.status(201).json({
            message: 'Banner Berhasil di Tambah',
            data: newBanner,
        });
    } catch (error) {
        // kalau proses gagal SETELAH gambar baru sempat di-compress, hapus gambar baru itu
        // supaya tidak ada file "yatim" tanpa referensi di DB
        if (imagePath) {
            const filePath = path.join(process.cwd(), imagePath);
            fs.unlink(filePath, () => {});
        }
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const seeAllBanner = async (req, res) => {
    try {
        const result = await getBanner();
        res.status(200).json({
            message: 'Berhasil Ambil Data Banner',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
