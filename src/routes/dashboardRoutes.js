import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { barangKeluarToday, barangMasukToday, barangTipis, totalBarang } from '../controller/dashboardController.js';

const router = express.Router();

router.get('/total-barang', authMiddleware, totalBarang);
router.get('/stok-tipis', authMiddleware, barangTipis);
router.get('/barang-keluar', authMiddleware, barangKeluarToday);
router.get('/barang-masuk', authMiddleware, barangMasukToday);

export default router;
