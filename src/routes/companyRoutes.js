import express from 'express';
import {
    createBanner,
    createCompany,
    seeAllAds,
    seeAllBanner,
    seeAllCompany,
} from '../controller/companyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.get('/ads', seeAllAds);
router.get('/', seeAllCompany);
router.get('/banner', seeAllBanner);
router.post('/upload', authMiddleware, upload.single('bannerImageUrl'), createBanner);
router.post('/kelola-landing-page', authMiddleware, createCompany);

export default router;
