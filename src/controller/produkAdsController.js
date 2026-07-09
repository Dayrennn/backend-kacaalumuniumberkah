import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma.js';
import compressToWebp from '../utils/compressWebp.js';
import { addProdukAds, getProdukAds } from '../service/produkAdsService.js';

export const createAds = async (req, res) => {
    let imagePath = null;

    try {
        const { barangId, deskripsi } = req.body;
        const image = req.file;

        if (!barangId) {
            return res.status(400).json({ message: 'Barang dan Kategori wajib diisi' });
        }
        if (!image) {
            return res.status(400).json({ message: 'Gambar Wajib di Upload' });
        }

        // baru compress gambar setelah data valid
        imagePath = await compressToWebp(image.buffer, `produk-${barangId}`);

        const produkAds = await addProdukAds({
            barangId,
            deskripsi,
            produkImageUrl: imagePath,
        });

        return res.status(201).json({
            message: 'Iklan Berhasil di Tambah',
            data: produkAds,
        });
    } catch (error) {
        if (imagePath) {
            const filePath = path.join(process.cwd(), imagePath);
            fs.unlink(filePath, () => {});
        }
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const seeAllProdukAds = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await getProdukAds({ page, limit });

        return res.status(200).json({
            message: 'Berhasil Ambil Data Iklan',
            ...result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};
