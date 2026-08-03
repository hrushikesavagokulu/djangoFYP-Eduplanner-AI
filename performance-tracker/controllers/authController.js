const bcrypt = require('bcryptjs');
const path = require('path');
const fileHandler = require('../utils/fileHandler');

const USERS_FILE = path.join(__dirname, '../data/users.json');

/**
 * Controller for authentication operations.
 */
const authController = {
    /**
     * Register a new user.
     */
    register: async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        try {
            const users = await fileHandler.read(USERS_FILE) || [];

            // Check if user already exists
            if (users.find(u => u.username === username)) {
                return res.status(400).json({ error: 'Username already exists.' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = {
                id: Date.now(),
                username,
                password: hashedPassword
            };

            users.push(newUser);
            await fileHandler.write(USERS_FILE, users);

            res.status(201).json({ message: 'User registered successfully.' });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error during registration.' });
        }
    },

    /**
     * Login a user.
     */
    login: async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        try {
            let users = await fileHandler.read(USERS_FILE) || [];
            
            // Seed tester user if not exists
            if (users.length === 0 || !users.find(u => u.username === 'gokul')) {
                const hashedTesterPassword = await bcrypt.hash('12345', 10);
                users.push({
                    id: 1,
                    username: 'gokul',
                    password: hashedTesterPassword
                });
                await fileHandler.write(USERS_FILE, users);
            }

            const user = users.find(u => u.username === username);

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            // Set session
            req.session.userId = user.id;
            req.session.username = user.username;

            res.status(200).json({ message: 'Login successful.', user: { id: user.id, username: user.username } });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error during login.' });
        }
    },

    /**
     * Logout a user.
     */
    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Could not log out.' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logout successful.' });
        });
    },

    /**
     * Check authentication status.
     */
    check: (req, res) => {
        if (req.session && req.session.userId) {
            res.status(200).json({ authenticated: true, username: req.session.username });
        } else {
            res.status(200).json({ authenticated: false });
        }
    }
};

module.exports = authController;
