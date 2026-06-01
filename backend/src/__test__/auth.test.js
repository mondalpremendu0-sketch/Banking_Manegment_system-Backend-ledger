const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB, clearDB, closeDB } = require("./setup/db.js");

const { login_controller } = require("../controllers/auth.controller.js");
const User = require("../model/user.model.js");

jest.mock("jsonwebtoken");
//jest.mock("bcryptjs");

// 1. DB and connect
beforeAll(async () => {
        await connectDB();
    });
// 2. clear DB 
beforeEach(async () => {
  await clearDB();
})
// 3. Drop DB and disconnect
afterAll(async () => {

        await closeDB();
    });


describe("Auth Controller - Registration", () => {
    let req, res, next;
    
    beforeEach(async () => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();

    });

    

    it("should return 400 if user already exists", async () => {
        // Setup existing user
        await User.create({
            name: "existinguser",
            email: "test@test.com",
            password: "hashedpassword123"
        });

        req.body = {
            Username: "newuser",
            email: "test@test.com",
            password: "password123"
        };

        await login_controller(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe("User already Exists");
    });

    it("should successfully create a user and save it to Atlas", async () => {
        req.body = {
            Username: "testuser",
            email: "new@test.com",
            password: "password123"
        };
        jwt.sign.mockResolvedValue("fake-jwt-token");

        const response = await login_controller(req, res, next);
console.log(response);
        expect(res.status).toBe(201);

        // Verify in Database
        const userInDb = await User.findOne({ email: "new@test.com" });
        
        expect(userInDb).toBeTruthy();
        expect(userInDb.name).toBe("testuser");
    });
});
