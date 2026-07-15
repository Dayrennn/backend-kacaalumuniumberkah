import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    createBarang,
    modifyBarang,
    removeBarang,
    seeAllBarang,
    seeAllBarangPotongan,
    seeBarangAktif,
} from '../controller/barangController.js';

const router = express.Router();

router.post('/create', authMiddleware, createBarang);
router.get('/', seeAllBarang);
router.get('/aktif', seeBarangAktif);
router.get('/potongan', seeAllBarangPotongan);
router.put('/update/:id', authMiddleware, modifyBarang);
router.delete('/delete/:id', authMiddleware, removeBarang);

export default router;
