import {
    addProdukAds,
    getProdukAds,
    removeProdukAds,
    updateProdukAds,
} from '../service/produkAdsService.js';

export const createAds = async (req, res) => {
    try {
        const { barangId, deskripsi } = req.body;
        const image = req.file;

        if (!barangId) {
            return res.status(400).json({ message: 'Barang dan Kategori wajib diisi' });
        }
        if (!image) {
            return res.status(400).json({ message: 'Gambar Wajib di Upload' });
        }


        const produkAds = await addProdukAds({
            barangId,
            deskripsi,
            imageBuffer: image.buffer,
        });

        return res.status(201).json({
            message: 'Iklan Berhasil di Tambah',
            data: produkAds,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const modifyProdukAds = async (req, res) => {
    try {
        const { id } = req.params;
        const { barangId, deskripsi } = req.body;
        const image = req.file;

        const product = await updateProdukAds(id, {
            barangId,
            deskripsi,
            imageBuffer: image?.buffer ?? undefined,
        });

        return res.status(200).json({
            message: 'Iklan berhasil dirubah',
            data: product,
        });
    } catch (error) {
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

export const removeAds = async (req, res) => {
    try {
        const { id } = req.params;
        await removeProdukAds(id); // hapus DB record + hapus gambar di Cloudinary, sudah ditangani service

        return res.status(200).json({ message: 'Berhasil Hapus Data Produk' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
