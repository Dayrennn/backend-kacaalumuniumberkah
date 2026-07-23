import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// import router
import userRoutes from '../routes/userRoutes.js';
import kategoriRoutes from '../routes/kategoriRoutes.js';
import barangRoutes from '../routes/barangRoutes.js';
import mutasiRoutes from '../routes/mutasiRoutes.js';
import produkAds from '../routes/produkAdsRoutes.js';
import laporanRoutes from '../routes/laporanRoutes.js';
import companyRoutes from '../routes/companyRoutes.js';
import dashboardRoutes from '../routes/dashboardRoutes.js';

const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(
    cors({
        origin: ['http://localhost:3001', 'https://frontend-kacaalumuniumberkah.vercel.app'],
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// app router
app.use('/auth', userRoutes);
app.use('/kategori', kategoriRoutes);
app.use('/barang', barangRoutes);
app.use('/mutasi', mutasiRoutes);
app.use('/produk-ads', produkAds);
app.use('/laporan', laporanRoutes);
app.use('/company', companyRoutes);
app.use('/dashboard', dashboardRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
