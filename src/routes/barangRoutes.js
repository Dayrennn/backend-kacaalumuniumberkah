import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createBarang, modifyBarang, seeAllBarang } from '../controller/barangController.js';

const router = express.Router();

router.post('/create', authMiddleware, createBarang);
router.get('/', seeAllBarang);
router.put('/update/:id', authMiddleware, modifyBarang);

export default router;
