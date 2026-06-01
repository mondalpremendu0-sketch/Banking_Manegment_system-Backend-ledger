const express = require("express");
const bcrypt = require("bcryptjs");
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");

const User = require("../model/user.model.js");
const AppError = require("../utils/error.utils.js");



async function login_controller(req, res,next) {
    try {
        const { Username, email, password } = req.body;

        if (!email || !password) {
            return next(new AppError("All fields are required",400))
        }

        const isExsistingUser = await User.findOne({ email });

        if (isExsistingUser) {
            return next(new AppError("User already Exists",400))
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = User.create({
            name: Username,
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
          message:"loged in successfully!",
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
    login_controller
};
