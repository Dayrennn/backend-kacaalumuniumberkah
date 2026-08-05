import express from 'express';
import { printLaporanGabungan, printLaporanKeluar, printLaporanMasuk } from '../controller/laporanController.js';

const router = express.Router();

router.get('/masuk/pdf', printLaporanMasuk);
router.get('/keluar/pdf', printLaporanKeluar);
router.get('/gabungan/pdf', printLaporanGabungan);

export default router;
