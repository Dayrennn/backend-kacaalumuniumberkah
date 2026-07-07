import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    addBarangKeluar,
    addBarangMasuk,
    seeAllMutasiKeluar,
    seeAllMutasiMasuk,
    seeMutasiMasukByBarang,
} from '../controller/mutasiController.js';

const router = express.Router();

// barang masuk
router.post('/create/masuk', authMiddleware, addBarangMasuk);
router.get('/masuk', authMiddleware, seeAllMutasiMasuk);
router.get('/masuk/:barangId', authMiddleware, seeMutasiMasukByBarang);

// barang keluar
router.post('/create/keluar', authMiddleware, addBarangKeluar);
router.get('/keluar', authMiddleware, seeAllMutasiKeluar);

export default router;
