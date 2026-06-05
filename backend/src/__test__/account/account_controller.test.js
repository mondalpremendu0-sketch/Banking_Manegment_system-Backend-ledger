// __test__/createAccount.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { connectDB, closeDB, clearDB } = require("../setup/db.js");
const Account = require("../../model/account.model.js"); // Adjust path to your Account model
const {
    createAccount_controller
} = require("../../controllers/account.controller.js"); // Adjust path

// --- Mock Express App Setup ---
const app = express();
app.use(express.json());

// DUMMY AUTH MIDDLEWARE: Injects `req.user` based on a test header
app.use((req, res, next) => {
    req.user = { userId: req.headers["x-test-user-id"] };
    next();
});

// Mount the controller
app.post("/api/user/account", createAccount_controller);

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

describe("POST /api/user/account Controller", () => {
    // Branch 1: The Happy Path (201 Created)
    it("should create a new account successfully and return 201", async () => {
        // Generate a valid MongoDB ID for our fake user
        const fakeUserId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .post("/api/user/account")
            .set("x-test-user-id", fakeUserId);
console.log(response.body.newAccount);
        // Validate the HTTP response
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("account created successfully "); // Matches your exact string with the trailing space

        // Validate the account data returned in the response
        expect(response.body.newAccount.account).toBeDefined();
        expect(response.body.newAccount.account).toBe(fakeUserId);

        // Validate the account was actually saved to the mock database
        // Check that the account was actually saved using its own unique _id
        const newAccountId = response.body.newAccount._id;
        const dbAccount = await Account.findById(newAccountId);
        
       // expect(dbAccount).toBeTruthy();
        expect(dbAccount.account.toString()).toBe(fakeUserId); // Verifies the reference is correct!
    });

    // Branch 2: Account Creation Fails Silently (400 Bad Request)
    it("should return 400 if the database fails to return the created account", async () => {
        const fakeUserId = new mongoose.Types.ObjectId().toString();

        // Override Mongoose's .create() to return null instead of an account object
        jest.spyOn(Account, "create").mockResolvedValue(null);

        const response = await request(app)
            .post("/api/user/account")
            .set("x-test-user-id", fakeUserId);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("can't create account right now");
    });

    // Branch 3: Catch Block (500 Internal Server Error)
    it("should return 500 if an unexpected database error occurs", async () => {
        const fakeUserId = new mongoose.Types.ObjectId().toString();

        // Force an actual crash in the database layer
        jest.spyOn(Account, "create").mockRejectedValue(
            new Error("Mongo Timeout")
        );

        const response = await request(app)
            .post("/api/user/account")
            .set("x-test-user-id", fakeUserId);

        expect(response.status).toBe(500);
        // Matching your hardcoded catch block error message
        expect(response.body.message).toBe("Database disconnected");
    });
});
