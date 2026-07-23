import prisma from '../config/prisma.js';
import { comparePassword, hashPassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';

export const loginUser = async ({ username, password }) => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            role: true,
            password: true,
            isDeleted: true,
        },
    });

    if (!user || user.isDeleted) {
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
        where: { id, isDeleted: false },
        select: {
            username: true,
            role: true,
        },
    });
    return user;
};

export const createUser = async ({ username, role, password }) => {
    if (!username) {
        throw new Error('Username Wajib di Isi');
    }
    if (!password) {
        throw new Error('Password Wajib di Isi');
    }

    const existingUser = await prisma.user.findFirst({
        where: { username, isDeleted: false },
    });

    if (existingUser) {
        throw new Error('Nama sudah digunakan');
    }

    const hash = await hashPassword(password);

    const newUser = await prisma.user.create({
        data: {
            username,
            ...(role ? { role } : {}),
            password: hash,
        },
        select: {
            id: true,
            username: true,
            role: true,
        },
    });

    return newUser;
};

export const getAllUser = async () => {
    const seeUser = await prisma.user.findMany({
        where: { isDeleted: false },
        select: {
            id: true,
            username: true,
            role: true,
        },
    });

    return seeUser;
};

export const editUser = async (id, { username, role, password }) => {
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser || existingUser.isDeleted) {
        throw new Error('User Tidak Ditemukan');
    }

    if (username) {
        const existingUsername = await prisma.user.findFirst({
            where: { username, isDeleted: false, NOT: { id } },
        });
        if (existingUsername) {
            throw new Error('Username telah digunakan');
        }
    }

    const validRoles = ['Admin', 'Owner'];
    if (role && !validRoles.includes(role)) throw new Error('Role tidak valid');

    const data = {};
    if (username) data.username = username;
    if (role) data.role = role;
    if (password) data.password = await hashPassword(password);

    const updateUser = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            username: true,
            role: true,
        },
    });

    return updateUser;
};

export const deleteUser = async (id, { username }) => {
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        throw new Error('User Tidak Ditemukan');
    }

    if (existingUser.isDeleted) {
        throw new Error('User sudah dihapus');
    }

    if (existingUser.username !== username) {
        throw new Error('Username tidak sesuai');
    }

    const remove = await prisma.user.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
        select: {
            id: true,
            username: true,
            role: true,
            isDeleted: true,
        },
    });

    return remove;
};
