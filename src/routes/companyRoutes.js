import express from 'express';
import { seeAllAds } from '../controller/companyController.js';

const router = express.Router();
router.get('/ads', seeAllAds);

export default router;
