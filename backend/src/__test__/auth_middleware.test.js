// __test__/auth.middleware.test.js
const jwt = require('jsonwebtoken');
const isLogedIn = require('../middlewares/auth.middleware.js'); // Adjust path to your middleware
const AppError = require('../utils/error.utils.js'); // Adjust path to your AppError

// Mock the jsonwebtoken library so we don't need real tokens
jest.mock('jsonwebtoken');

describe('isLogedIn Authentication Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Reset our fake request, response, and next functions before every test
        mockReq = {
            cookies: {}
        };
        mockRes = {}; 
        mockNext = jest.fn(); // jest.fn() allows us to track if/how next() was called
        
        process.env.JWT_SECRET = 'test-secret';
    });

    afterEach(() => {
        jest.clearAllMocks(); // Cleans up the mocked jwt library between tests
    });

    // Branch 1: No Token Provided (400)
    it('should call next with a 400 error if no token is in cookies', async () => {
        // req.cookies is empty, so token is undefined
        await isLogedIn(mockReq, mockRes, mockNext);

        // Verify next() was called once
        expect(mockNext).toHaveBeenCalledTimes(1);
        
        // Extract the error passed to next()
        const errorArg = mockNext.mock.calls[0][0]; 
        
        expect(errorArg).toBeInstanceOf(AppError);
        expect(errorArg.message).toBe("Unauthorised!!");
        // Note: Assuming your AppError sets a 'statusCode' property!
        expect(errorArg.statusCode).toBe(400); 
    });

    // Branch 2: Falsy Verification (400)
    it('should call next with a 400 error if jwt.verify returns falsy', async () => {
        mockReq.cookies.token = 'fake-token';
        
        // Force jwt.verify to return null (simulating the !verifiedUser check)
        jwt.verify.mockReturnValue(null);

        await isLogedIn(mockReq, mockRes, mockNext);

        const errorArg = mockNext.mock.calls[0][0];
        expect(errorArg.message).toBe("Invalid token,Unauthorised!!");
        expect(errorArg.statusCode).toBe(400);
    });

    // Branch 3: The Happy Path (Proceeds to next route)
    it('should set req.user and call next() without errors if token is valid', async () => {
        mockReq.cookies.token = 'valid-token';
        
        const decodedPayload = { email: 'test@test.com', username: 'testuser' };
        
        // Force jwt.verify to successfully return our fake user payload
        jwt.verify.mockReturnValue(decodedPayload);

        await isLogedIn(mockReq, mockRes, mockNext);

        // Verify that jwt.verify was called with the right arguments
        expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
        
        // Verify the payload was attached to req.user
        expect(mockReq.user).toEqual(decodedPayload);
        
        // Verify next() was called completely empty (which means success!)
        expect(mockNext).toHaveBeenCalledWith(); 
    });

    // Branch 4: The Catch Block (500)
    it('should call next with a 500 error if jwt.verify throws an error', async () => {
        mockReq.cookies.token = 'expired-token';
        
        // Force jwt.verify to crash, like it does when a token is expired
        jwt.verify.mockImplementation(() => {
            throw new Error('jwt expired');
        });

        await isLogedIn(mockReq, mockRes, mockNext);

        const errorArg = mockNext.mock.calls[0][0];
        expect(errorArg.message).toBe("jwt expired");
        expect(errorArg.statusCode).toBe(500);
    });
});