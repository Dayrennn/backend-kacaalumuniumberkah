import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma.js';
import compressToWebp from '../utils/compressWebp.js';
import { addProdukAds, deleteProdukAds, getProdukAds, updateProdukAds } from '../service/produkAdsService.js';

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

export const modifyProdukAds = async (req, res) => {
    let imagePath = null;

    try {
        const { id } = req.params;
        const { barangId, deskripsi } = req.body;
        const image = req.file;

        // gambar bersifat opsional saat update — user boleh cuma ganti deskripsi
        if (image) {
            imagePath = await compressToWebp(image.buffer, `produk-${barangId ?? id}`);
        }

        const product = await updateProdukAds(id, {
            barangId,
            deskripsi,
            produkImageUrl: imagePath ?? undefined,
        });

        // hapus gambar lama HANYA kalau update berhasil dan memang ada gambar lama yang digantikan
        if (product.oldImageUrl) {
            const oldFilePath = path.join(process.cwd(), product.oldImageUrl);
            fs.unlink(oldFilePath, (err) => {
                if (err) console.error('Gagal hapus gambar lama:', err.message);
            });
        }

        return res.status(200).json({
            message: 'Iklan berhasil dirubah',
            data: product,
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

export const removeProdukAds = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteProdukAds(id);

        if (deleted.produkImageUrl) {
            const filePath = path.join(process.cwd(), deleted.produkImageUrl);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Gagal hapus file gambar:', err.message);
            });
        }

        res.status(200).json({
            message: 'Berhasil Hapus Data Produk',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }
};
