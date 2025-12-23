const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class AuthController {
    // POST /api/v1/auth/register
    async register(req, res) {
        try {
            const { email, password, name } = req.body;

            // Validate input
            if (!email || !password || !name) {
                return res.status(400).json({
                    success: false,
                    error: 'Email, password and name are required'
                });
            }

            // Check if user already exists
            const existingUser = await db.query(
                'SELECT id FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is already registered'
                });
            }

            // Validate password strength
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'Password must be at least 8 characters long'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Create user
            const result = await db.query(
                `INSERT INTO users (id, email, password_hash, name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, created_at`,
                [uuidv4(), email.toLowerCase(), passwordHash, name]
            );

            const user = result.rows[0];

            res.status(201).json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to register user'
            });
        }
    }

    // POST /api/v1/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }

            // Find user
            const result = await db.query(
                'SELECT id, email, name, password_hash, is_active FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            const user = result.rows[0];

            // Check if user is active
            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    error: 'Account is deactivated'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Update last login
            await db.query(
                'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({
                success: true,
                data: {
                    access_token: token,
                    token_type: 'Bearer',
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to login'
            });
        }
    }

    // GET /api/v1/auth/me
    async getProfile(req, res) {
        try {
            const result = await db.query(
                `SELECT id, email, name, avatar_url, created_at, last_login_at
         FROM users WHERE id = $1`,
                [req.user.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get profile'
            });
        }
    }

    // POST /api/v1/auth/change-password
    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Old password and new password are required'
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'New password must be at least 8 characters long'
                });
            }

            // Get current password hash
            const result = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [req.user.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Verify old password
            const isValid = await bcrypt.compare(oldPassword, result.rows[0].password_hash);

            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Old password is incorrect'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const newPasswordHash = await bcrypt.hash(newPassword, salt);

            // Update password
            await db.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [newPasswordHash, req.user.userId]
            );

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to change password'
            });
        }
    }
}

module.exports = new AuthController();