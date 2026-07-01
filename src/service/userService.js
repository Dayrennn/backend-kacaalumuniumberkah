import prisma from '../config/prisma.js';
import { comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';

export const loginUser = async ({ username, password }) => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            role: true,
            password: true,
        },
    });

    if (!user) {
        throw new Error('User Tidak Ditemukan');
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        throw new Error('Username atau Password Salah');
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });

    return { user, token };
};

export const getOneUser = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            username: true,
            role: true,
        },
    });
    return user;
};
