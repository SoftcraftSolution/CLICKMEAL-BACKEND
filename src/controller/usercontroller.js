const User = require('../model/user.model'); // Adjust the path as necessary

// Registration API
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password,phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Create a new user with plain text password
        const newUser = new User({
            fullName,
            email,
            password,
            phoneNumber // Storing the plain text password
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Login API
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check the password (simple comparison)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};
