import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// import router
import userRoutes from '../routes/userRoutes.js';
import kategoriRoutes from '../routes/kategoriRoutes.js';

const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(
    cors({
        origin: ['http://localhost:3001', "https://frontend-kacaalumuniumberkah.vercel.app"],
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

// app router
app.use('/auth', userRoutes);
app.use('/kategori', kategoriRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
