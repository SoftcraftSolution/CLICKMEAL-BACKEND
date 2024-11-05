const User = require('../model/user.model');
const Company=require('../model/company.model') // Adjust the path as necessary

// Registration API
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, companyId } = req.body;

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
            phoneNumber,
            companyId // Save the companyId for reference
        });

        // Save the user to the database
        await newUser.save();

        // Fetch the company details using companyId
        const company = await Company.findById(companyId);
        const companyName = company ? company.name : null; // Get the company name

        // Respond with the user data along with the company name
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                ...newUser.toObject(), // Convert Mongoose document to plain object
                companyName // Include company name in the response
            }
        });
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
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users
        const users = await User.find();

        // Map through users to get company names
        const usersWithCompanyNames = await Promise.all(users.map(async (user) => {
            const company = await Company.findById(user.companyId); // Fetch company details
            return {
                ...user.toObject(), // Convert Mongoose document to plain object
                companyName: company ? company.name : null // Include company name
            };
        }));

        res.status(200).json({
            message: 'Users fetched successfully',
            users: usersWithCompanyNames
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};