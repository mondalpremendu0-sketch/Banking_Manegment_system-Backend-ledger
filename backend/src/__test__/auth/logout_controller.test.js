// __test__/logout.test.js
const request = require('supertest');
const express = require('express');
const { logout_controller } = require('../../controllers/auth.controller.js'); // Adjust path

// --- Mock Express App Setup ---
const app = express();

// Mount the controller (Logout is typically a GET or POST request)
app.get('/api/user/logout', logout_controller); 

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message
    });
});

beforeEach(() => {
    jest.restoreAllMocks(); // Clean up spies between tests
});

describe('GET /api/user/logout Controller', () => {

    // Branch 1: The Happy Path (200 OK)
    it('should clear the cookie and return 200 successfully', async () => {
        const response = await request(app)
            .get('/api/user/logout');

        // Check the JSON response
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("loged out successfully");

        // Check that the cookie was modified
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        
        // Tests if the cookie was set (even if set to the string "undefined")
        expect(cookies[0]).toMatch(/token=/); 
    });

    // Branch 2: The Catch Block (500 Internal Server Error)
    it('should return 500 if an unexpected error occurs', async () => {
        // Because there are no DB calls, we force an error by overriding Express's res.cookie function
        jest.spyOn(express.response, 'cookie').mockImplementationOnce(() => {
            throw new Error('Simulated server crash');
        });

        const response = await request(app)
            .get('/api/user/logout');

        expect(response.status).toBe(500);
        
        // Matching the hardcoded error message in your catch block
        expect(response.body.message).toBe("Database disconnected"); 
    });
});