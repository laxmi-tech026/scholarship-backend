const jwt = require('jsonwebtoken');
const User = require("../models/User");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, "secretkey");
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).send("User not found");
        req.user = user;
        next();
    } catch {
        res.status(401).send("Invalid Token");
    }
};

module.exports = auth;
