// __tests__/login.test.js
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { connectDB, closeDB, clearDB } = require('./setup/db.js');
const User = require('../model/user.model.js'); 
const { login_controller } = require('../controllers/auth.controller.js'); // Adjust path
const app = require('../app.js')
process.env.JWT_SECRET = 'test-secret-key';

// --- Test Hooks ---
beforeAll(async () => await connectDB());
afterEach(async () => {
    await clearDB();
    jest.restoreAllMocks();
});
afterAll(async () => await closeDB());

describe('POST /api/user/login Controller', () => {

    const plainTextPassword = 'MySecretPassword123';
    let seededUser;

    // Helper to seed a user before tests that need an existing account
    const seedUser = async () => {
        const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
        return await User.create({
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: hashedPassword
        });
    };

    // Branch 1: Missing Fields (400)
    it('should return 400 if email or password is missing', async () => {
        const response = await request(app)
            .post('/api/user/login')
            .send({ email: 'jane@example.com' }); // Missing password

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
    });

    // Branch 2: User Not Found (400)
    it('should return 400 if the user does not exist in the database', async () => {
        const response = await request(app)
            .post('/api/user/login')
            .send({ email: 'ghost@example.com', password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User not found!');
    });

    // Branch 3: Wrong Password (400)
    it('should return 400 if the password does not match', async () => {
        await seedUser(); // Inject user into DB

        const response = await request(app)
            .post('/api/user/login')
            .send({ email: 'jane@example.com', password: 'WrongPassword!' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Wrong Password');
    });

    // Branch 4: The Happy Path (200 OK)
    it('should successfully log in, set a cookie, and return 200', async () => {
        const user = await seedUser(); // Inject user into DB

        const response = await request(app)
            .post('/api/user/login')
            .send({ email: 'jane@example.com', password: plainTextPassword });

        // Validate Status and JSON Body
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Loged in successfully!');
        expect(response.body.userDetails.email).toBe(user.email);
        expect(response.body.userDetails.username).toBe(user.name);

        // Validate Cookie
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toMatch(/token=([^;]+)/);
    });

    // Branch 5: Catch Block (500)
    it('should return 500 if an unexpected database error occurs', async () => {
        // Force User.findOne to crash
        jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Mongo Network Error'));

        const response = await request(app)
            .post('/api/user/login')
            .send({ email: 'jane@example.com', password: plainTextPassword });

        expect(response.status).toBe(500);
        // Note: Your specific catch block hardcodes "Database disconnected" instead of using err.message
        expect(response.body.message).toBe('Database disconnected'); 
    });
});