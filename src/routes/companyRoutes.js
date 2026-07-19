import express from 'express';
import { createCompany, seeAllAds, seeAllCompany } from '../controller/companyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/ads', seeAllAds);
router.get('/', seeAllCompany);
router.post('/kelola-landing-page', authMiddleware, createCompany);

export default router;
