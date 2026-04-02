const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev-access-secret-change-me";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret-change-me";

function isValidUser (id) {
    const pattern = /^BWF-\d{4}-\d+$/;
    return pattern.test(id);
}

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user._id,
            role: user.role,
            auth_id: user.auth_id
        },
        ACCESS_SECRET,
        {
            expiresIn: "15m",
            jwtid: randomUUID()
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user._id,
            role: user.role,
            auth_id: user.auth_id
        },
        REFRESH_SECRET,
        {
            expiresIn: "7d",
            jwtid: randomUUID()
        }
    );
}

module.exports = {
    isValidUser,
    generateAccessToken,
    generateRefreshToken
}