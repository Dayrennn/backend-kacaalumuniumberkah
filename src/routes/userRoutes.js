import express from 'express';
import { addUser, getMe, login, logout, modifyUser, removeUser, seeAllUser } from '../controller/userController.js';
import { authMiddleware, authorizationRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/create', authMiddleware, authorizationRole('Owner'), addUser);
router.get('/all-user', authMiddleware, authorizationRole('Owner'), seeAllUser);
router.put('/update/:id', authMiddleware, authorizationRole('Owner'), modifyUser);
router.put('/delete/:id', authMiddleware, authorizationRole('Owner'), removeUser);
router.get('/me', authMiddleware, getMe);

export default router;
