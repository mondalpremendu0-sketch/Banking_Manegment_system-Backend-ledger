const express = require("express");
const bcrypt = require("bcryptjs");
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");

const User = require("../model/user.model.js");

async function login_controller(req, res) {
    try {
        const { Username, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email or password must be fill!"
            });
        }

        const isExsistingUser = await User.findOne({ email });

        if (isExsistingUser) {
            return res.status(400).json({
                success: false,
                message: "User already Exists!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = User.create({
            name: Username,
            email,
            password: hashedPassword
        });

        newUser.password = undefined;

        const token = await jwt.sign(
            {
                email: newUser.email,
                username: newUser.name
            },
            process.env.JWT_SECRET
        );
        
        cookie.set("token",token)
        
        res.status(201).json({ 
          success:true,
          message:"loged in successfully!",
          userDetails:{
            username:newUser.name,
            email:newUser.email
          }
        });
    } catch (err) {
        console.error("login Error:", err);
    }
}

module.exports = {
    login_controller
};
