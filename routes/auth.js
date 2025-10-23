import express from 'express'
import { login, logout, refreshToken, register } from '../controllers/auth/auth';
import authenticateUser from '../middleware/authenticate.js'

const router = express.Router();

router.post("/refresh-token",refreshToken);
router.post("/logout",authenticateUser,logout);
router.post("/register",register);
router.post("/login",login);