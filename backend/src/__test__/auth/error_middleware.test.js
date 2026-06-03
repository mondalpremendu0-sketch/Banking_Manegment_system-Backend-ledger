// __test__/error.middleware.test.js
const errorMiddleware = require('../../middlewares/error.middleware');

describe('Error Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Mock the Express req, res, and next objects
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(), // Allows chaining: res.status().json()
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    // 1. Testing the branches you already had covered (Custom Errors)
    it('should use the provided error message and status code', () => {
        const customError = {
            message: 'A specific error occurred',
            statusCode: 401,
            stack: 'Error stack trace here'
        };

        errorMiddleware(customError, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'A specific error occurred',
            stack: 'Error stack trace here'
        });
    });

    // 2. Testing the MISSING branches (Fallback Defaults)
    it('should use default values if message and statusCode are missing', () => {
        const emptyError = {}; // Notice there is no message or statusCode!

        errorMiddleware(emptyError, mockReq, mockRes, mockNext);

        // It should hit the `|| 500` branch
        expect(mockRes.status).toHaveBeenCalledWith(500); 
        
        // It should hit the `|| "Somthing went wrong"` branch
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Somthing went wrong', // Note: Matching your spelling exactly!
            stack: undefined
        });
    });
});