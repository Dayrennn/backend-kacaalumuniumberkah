import express from 'express';
import { printLaporanKeluar, printLaporanMasuk } from '../controller/laporanController.js';

const router = express.Router();

router.get('/masuk/pdf', printLaporanMasuk);
router.get('/keluar/pdf', printLaporanKeluar);

export default router;
