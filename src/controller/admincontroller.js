const Admin=require('../model/admin.model')

exports.login = async (req, res) => {
    // Set default credentials
    const defaultEmail = 'admin@example.com'; // Replace with your desired default email
    const defaultPassword = 'defaultPassword123'; // Replace with your desired default password
  
    const { email, password } = req.body;
  
    try {
      // Check if the provided credentials match the default ones
      if (email !== defaultEmail || password !== defaultPassword) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      // Successful login response
      res.status(200).json({ message: 'Login successful.', admin: { email: defaultEmail } });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };