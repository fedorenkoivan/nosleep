import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days
/**
 * Register a new user
 */
export async function registerUser(data) {
    const { name, email, password } = data;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create user in database
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password_hash: hashedPassword,
            password_salt: salt
        }
    });
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token
    };
}
/**
 * Login existing user
 */
export async function loginUser(data) {
    const { email, password } = data;
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token
    };
}
/**
 * Verify JWT token and return user data
 */
export async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
}
/**
 * Get user by ID
 */
export async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            created_at: true
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}
