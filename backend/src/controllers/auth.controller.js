const express = require("express");
const bcrypt = require("bcryptjs");
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");

const User = require("../model/user.model.js");
const AppError = require("../utils/error.utils.js");



async function register_controller(req, res,next) {
    try {
        const { username, email, password } = req.body;

        if (!email || !password || !username) {
            return next(new AppError("All fields are required",400))
        }

        const isExsistingUser = await User.findOne({ email });

        if (isExsistingUser) {
            return next(new AppError("User already Exists",409))
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name: username,
            email,
            password: hashedPassword
        });
        if (!newUser) {
          return next(new AppError("Can't Create Account!",400))
        }

        newUser.password = undefined;

        const token = await jwt.sign(
            {
                email: newUser.email,
                username: newUser.name
            },
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        );
        
        res.cookie("token",token)
        
        res.status(201).json({ 
          success:true,
          message:"registered successfully!",
          userDetails:{
            username:newUser.name,
            email:newUser.email
          }
        });
    } catch (err) {
        return next(new AppError(err.message,500))
    }
}

module.exports = {
    register_controller
};
