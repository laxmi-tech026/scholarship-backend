const jwt = require('jsonwebtoken');
const User = require("../models/User");

const auth= async(req,resizeBy,next)=>{
    try{
        const token = req.header("Authorization").replace("Bearer ","");
        const decoded = jwt.verify(token,"secretkey");
        const user = await User.findById(decoded.id);
        req.user = user;
        next();
    }catch{
        resizeBy.status(401).send("Invalid Token");
    }
}

// const auth = (req, res, next) => {
//     const header = req.header('Authorization');

//     if (!header) {
//         return res.status(401).send("Access Denied");
//     }

//     const token = header.startsWith("Bearer ")
//         ? header.split(" ")[1]
//         : header;

//     try {
//         const verified = jwt.verify(token, "secretkey");
//         req.user = verified;
//         next();
//     } catch (err) {
//         res.status(400).send("Invalid Token");
//     }
// };

module.exports = auth;