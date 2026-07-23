import { createUser, deleteUser, editUser, getAllUser, getOneUser, loginUser } from '../service/userService.js';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { user, token } = await loginUser({ username, password });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: 'login berhasil',
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
    });
    res.status(200).json({ message: 'Logout Berhasil' });
};

export const getMe = async (req, res) => {
    try {
        const user = await getOneUser(req.user.id);
        res.status(200).json({
            message: 'Berhasil',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const addUser = async (req, res) => {
    try {
        const { username, role, password } = req.body;
        const add = await createUser({ username, role, password });
        res.status(200).json({
            message: 'Berhasil Membuat User',
            data: add,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const seeAllUser = async (req, res) => {
    try {
        const see = await getAllUser();
        res.status(200).json({
            message: 'Berhasil Mengambil Data User',
            data: see,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const modifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, password } = req.body;
        const edit = await editUser(id, { username, role, password });
        res.status(200).json({
            message: 'Data User Berhasil di Update',
            data: edit,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        await deleteUser(id, { username });
        res.status(200).json({
            message: 'Data Berhasil di Hapus',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
