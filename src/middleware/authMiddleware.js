import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'Token tidak di temukan' });
    }

    try {
        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, role: true, isDeleted: true },
        });

        if (!user || user.isDeleted) {
            return res.status(401).json({ message: 'Akun tidak ditemukan atau telah dinonaktifkan' });
        }

        req.user = user; // pakai data fresh dari DB, bukan cuma payload token yang bisa basi
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau expired' });
    }
};

export const authorizationRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user?.role)) {
            return res.status(403).json({ message: 'Kamu tidak punya akses untuk aksi ini' });
        }
        next();
    };
};
