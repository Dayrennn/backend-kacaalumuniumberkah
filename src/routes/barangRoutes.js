import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createBarang, modifyBarang, removeBarang, seeAllBarang } from '../controller/barangController.js';

const router = express.Router();

router.post('/create', authMiddleware, createBarang);
router.get('/', seeAllBarang);
router.put('/update/:id', authMiddleware, modifyBarang);
router.delete('/delete/:id', authMiddleware, removeBarang);

export default router;
