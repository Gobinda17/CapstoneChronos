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
}

module.exports = new AuthController();