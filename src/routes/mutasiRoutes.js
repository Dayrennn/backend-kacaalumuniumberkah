import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addBarangMasuk, seeAllMutasiMasuk, handleGetMutasiMasukByBarang } from '../controller/mutasiController.js';

const router = express.Router();

router.post('/create/masuk', authMiddleware, addBarangMasuk);
router.get('/masuk', authMiddleware, seeAllMutasiMasuk);
router.get('/masuk/:barangId', authMiddleware, handleGetMutasiMasukByBarang);

export default router;
