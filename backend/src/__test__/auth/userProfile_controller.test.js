// __test__/profile.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB } = require('../setup/db.js');
const User = require('../../model/user.model.js'); 
const { userProfile_controller } = require('../../controllers/auth.controller.js'); // Adjust path

// --- Mock Express App Setup ---
const app = express();
app.use(express.json());

// DUMMY AUTH MIDDLEWARE: Injects `req.user` based on a test header
app.use((req, res, next) => {
    // We pass the simulated user ID via headers just for testing purposes
    req.user = { userId: req.headers['x-test-user-id'] };
    next();
});

// Mount the controller
app.get('/api/user/profile', userProfile_controller);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message
    });
});

// --- Test Hooks ---
beforeAll(async () => await connectDB());
afterEach(async () => {
    await clearDB();
    jest.restoreAllMocks();
});
afterAll(async () => await closeDB());

describe('GET /api/user/profile Controller', () => {

    let seededUser;

    // Helper to seed a user before tests
    const seedUser = async () => {
        return await User.create({
            name: 'John Profile',
            email: 'profile@example.com',
            password: 'HashedPassword123'
        });
    };

    // Branch 1: User Not Found (400)
    it('should return 400 if the user does not exist in the database', async () => {
        // Generate a valid, but random/non-existent MongoDB ID
        const fakeId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .get('/api/user/profile')
            .set('x-test-user-id', fakeId); // Inject the fake ID

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Can't find userDetails");
    });

    // Branch 2: The Happy Path (200 OK)
    it('should return 200 and the user details if found', async () => {
        const user = await seedUser();

        const response = await request(app)
            .get('/api/user/profile')
            .set('x-test-user-id', user._id.toString()); // Inject the real ID

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User Details fetched successfully!");
        expect(response.body.userDetails.username).toBe(user.name);
        expect(response.body.userDetails.email).toBe(user.email);
        
        // Ensure password is not leaked (we used .select("-password") in the controller)
        expect(response.body.userDetails.password).toBeUndefined();
    });

    // Branch 3: Catch Block (500)
    it('should return 500 if an unexpected database error occurs', async () => {
        const user = await seedUser();

        // Correctly mock the Mongoose query chain: findOne().select()
        jest.spyOn(User, 'findOne').mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error('Mongo Network Error'))
        });

        const response = await request(app)
            .get('/api/user/profile')
            .set('x-test-user-id', user._id.toString());

        expect(response.status).toBe(500);
        // Matching your hardcoded catch block error message
        expect(response.body.message).toBe('Database disconnected'); 
    });
});