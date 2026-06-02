const express = require("express");
const bcrypt = require("bcryptjs");
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");

const User = require("../model/user.model.js");
const AppError = require("../utils/error.utils.js");

async function register_controller(req, res, next) {
    try {
        const { username, email, password } = req.body;

        if (!email || !password || !username) {
            return next(new AppError("All fields are required", 400));
        }

        const isExsistingUser = await User.findOne({ email });

        if (isExsistingUser) {
            return next(new AppError("User already Exists", 409));
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name: username,
            email,
            password: hashedPassword
        });
        if (!newUser) {
            return next(new AppError("Can't Create Account!", 400));
        }

        newUser.password = undefined;

        const token = await jwt.sign(
            {
                email: newUser.email,
                username: newUser.name
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token);

        res.status(201).json({
            success: true,
            message: "registered successfully!",
            userDetails: {
                username: newUser.name,
                email: newUser.email
            }
        });
    } catch (err) {
        return next(new AppError("Database disconnected", 500));
    }
}
async function login_controller(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError("All fields are required", 400));
        }

        const existingUser = await User.findOne({ email }).select("+password");

        if (!existingUser) {
            return next(new AppError("User not found!", 400));
        }

        const validPassword = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!validPassword) {
            return next(new AppError("Wrong Password", 400));
        }

        existingUser.password = undefined;
        const token = await jwt.sign(
            {
                email: existingUser.email,
                username: existingUser.name,
                userId: existingUser._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "5d"
            }
        );

        res.cookie("token", token);

        res.status(200).json({
            success: true,
            message: "Loged in successfully!",
            userDetails: {
                email: existingUser.email,
                username: existingUser.name
            }
        });
    } catch (err) {
        return next(new AppError("Database disconnected", 500));
    }
}
async function userProfile_controller(req, res, next) {
    try {
        const { userId } = req.user;

        const userInfo = await User.findById({ _id: userId }).select(
            "-password"
        );

        if (!userInfo) {
            return next(new AppError("Can't find userDetails", 400));
        }

        res.status(200).json({
            success: true,
            message: "User Details fetched successfully!",
            userDetails: {
                username: userInfo.name,
                email: userInfo.email
            }
        });
    } catch (err) {
        return next(new AppError("Database disconnected", 500));
    }
}

module.exports = {
    register_controller,
    login_controller,
    userProfile_controller
};
