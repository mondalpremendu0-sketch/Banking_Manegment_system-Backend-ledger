const jwt = require("jsonwebtoken");
const AppError = require("../utils/error.utils.js");

async function isLogedIn(req, res, next) {
    try {
        const { token } = req.cookies;
        if (!token) {
            return next(new AppError("Unauthorised!!", 400));
        }

        const verifiedUser = await jwt.verify(token, process.env.JWT_SECRET);

        if (!verifiedUser) {
            return next(new AppError("Invalid token,Unauthorised!!", 400));
        }

        req.user = verifiedUser;
        next();
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}

module.exports = isLogedIn;
