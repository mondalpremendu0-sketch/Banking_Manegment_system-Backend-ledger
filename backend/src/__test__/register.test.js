// __tests__/register.test.js
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser'); // Needed to parse the cookie in the app
const { connectDB, closeDB, clearDB } = require('./setup/db.js');
const User = require('../model/user.model.js'); 
const { register_controller } = require('../controllers/auth.controller.js'); // Adjust path
const app = require('../app.js')
// Set a dummy JWT secret for testing
process.env.JWT_SECRET = 'test-secret-key';

/*
// --- Mock Express App Setup ---
const app = express();
app.use(express.json());
app.use(cookieParser());

// Mount the controller
app.post('/api/user/register', register_controller);

// Mock Global Error Handler to catch your `next(new AppError(...))`
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message
    });
});
*/
// --- Test Hooks ---
beforeAll(async () => await connectDB());
afterEach(async () => {
    await clearDB();
    jest.restoreAllMocks(); // Critical: Resets mocks between tests
});
afterAll(async () => await closeDB());

describe('POST /api/user/register Controller', () => {

    const validUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
    };

    // Branch 1: Missing Fields (400 Bad Request)
    it('should return 400 if any required field is missing', async () => {
        const response = await request(app)
            .post('/api/user/register')
            .send({ email: 'test@example.com', password: 'Password123' }); // Missing username

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
    });

    // Branch 2: The Happy Path (201 Created)
    it('should successfully register a user, set a cookie, and return 201', async () => {
        const response = await request(app)
            .post('/api/user/register')
            .send(validUser);

        // Check Response
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('registered successfully!');
        expect(response.body.userDetails.username).toBe(validUser.username);
        expect(response.body.userDetails.email).toBe(validUser.email);

        // Check Cookie
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toMatch(/token=([^;]+)/); // Ensure token cookie is set

        // Check Database
        const dbUser = await User.findOne({ email: validUser.email });
        expect(dbUser).toBeTruthy();
        expect(dbUser.name).toBe(validUser.username);
        // Ensure password was hashed
        expect(dbUser.password).not.toBe(validUser.password); 
    });

    // Branch 3: Existing User (409 Conflict)
    it('should return 409 if the email is already in use', async () => {
        // Seed the DB
        await request(app).post('/api/user/register').send(validUser);

        // Attempt to register again
        const response = await request(app)
            .post('/api/user/register')
            .send(validUser);
        expect(response.status).toBe(409);
        expect(response.body.message).toBe('User already Exists');
        
    });

    // Branch 4: Account Creation Fails (400 Bad Request)
    // Simulates the `if (!newUser)` block
    it('should return 400 if account creation fails silently', async () => {
        // Mock Mongoose's create method to return a falsy value
        jest.spyOn(User, 'create').mockResolvedValue(null);

        const response = await request(app)
            .post('/api/user/register')
            .send(validUser);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Can't Create Account!");
        
    });

    // Branch 5: Catch Block (500 Internal Server Error)
    it('should return 500 if an unexpected error occurs', async () => {
        // Force a critical failure by mocking findOne to throw
        jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database disconnected'));

        const response = await request(app)
            .post('/api/user/register')
            .send(validUser);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Database disconnected');
        
    });
});
