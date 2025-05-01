const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ message: "Provide all details" });
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "An error occured while registering user", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Provide all details" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Incorrect login credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect login credentials" });
        }

        // Check if it's the first login and set the status to 'active'
        if (user.status === 'pending') {
            user.status = 'active'; // Set the status to active after first successful login
        }

        // Update lastLogin timestamp
        user.lastLogin = new Date();

        // Save the updated user information
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            message: "Login successful",
            token,
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while logging in", error: error.message });
    }
};



module.exports = {register, login };


