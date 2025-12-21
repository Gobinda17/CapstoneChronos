const userModel = require('../models/user.model');

const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

class AuthController {
    userRegistration = async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const hashPassword = await bcrypt.hash(password, saltRounds);

            const newUser = new userModel({
                name, email, password: hashPassword
            });

            await newUser.save();
            return res.status(201).send('User registered successfully');
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    userLogin = async (req, res) => {
        try {
            const { password } = req.body;
            const passwordMatch = await bcrypt.compare(password, req.user.password);
            if (!passwordMatch) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Invalid password'
                });
            }
            const token = jwt.sign({ id: req.user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            return res.cookie("accessToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 24 * 60 * 60 * 1000
            }).status(200).json({
                status: 'success',
                message: 'Login successful',
                user: {
                    name: req.user.name,
                    email: req.user.email
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    freshAccessToken = async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.user.id });
            if (!user) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }
            const token = jwt.sign({ id: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            return res.cookie("accessToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 24 * 60 * 60 * 1000
            }).status(200).json({
                status: 'success',
                message: 'Token refreshed successfully',
                user: {
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    userLogout = async (req, res) => {
        try {
            return res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax'
            }).status(200).json({
                status: 'success',
                message: 'Logout successful'
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    requestPasswordReset = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userModel.findOne({ email: email });
            if (!user) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }

            const hashPassword = await bcrypt.hash(password, saltRounds);
            user.password = hashPassword;

            await user.save();

            return res.status(200).json({
                status: 'success',
                message: 'Password reset successful'
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    getUserInfo = async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.user.id });
            if (!user) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }
            return res.status(200).json({
                status: 'success',
                user: {
                    email: user.email
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    updateUserEmail = async (req, res) => {
        try {
            const { newEmail } = req.body;
            const user = await userModel.findOne({ email: req.user.id });
            if (!user) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }
            user.email = newEmail;
            await user.save();
            const token = jwt.sign({ id: newEmail }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            return res.cookie("accessToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 24 * 60 * 60 * 1000
            }).status(200).json({
                status: 'success',
                message: 'Email Updated Successful',
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    updateUserPassword = async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await userModel.findOne({ email: req.user.id });
            if (!user) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Current password is incorrect'
                });
            }
            const hashPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = hashPassword;
            await user.save();
            return res.status(200).json({
                status: 'success',
                message: 'Password updated successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

}

module.exports = new AuthController();