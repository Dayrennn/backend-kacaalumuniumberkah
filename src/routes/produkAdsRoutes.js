import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { createAds, modifyProdukAds, removeAds, seeAllProdukAds } from '../controller/produkAdsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('produkImageUrl'), createAds);
router.get('/', authMiddleware, seeAllProdukAds);
router.put('/update/:id', authMiddleware, upload.single('produkImageUrl'), modifyProdukAds);
router.delete('/delete/:id', authMiddleware, removeAds);

export default router;
