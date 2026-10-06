const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const adminToken = req.cookies.adminSessionToken;
    const userToken = req.cookies.userSessionToken;

    let adminDecoded = null;
    let userDecoded = null;

    if (adminToken) {
        try {
            adminDecoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        } catch (err) {
            res.clearCookie("adminSessionToken"); // Clear the expired token
            return res.status(401).json({ message: "Admin session expired. Please login again." });
        }
    }

    if (userToken) {
        try {
            userDecoded = jwt.verify(userToken, process.env.JWT_SECRET);
            console.log("auth middleware"+userDecoded)
        } catch (err) {
            res.clearCookie("userSessionToken"); 
            return res.status(401).json({ message: "User session expired. Please login again." });
        }
    }

    if (adminDecoded) {
        req.user = adminDecoded;
        req.user.role = "admin";
    } else if (userDecoded) {
        req.user = userDecoded;
        req.user.role = "user";
    } else {
        return res.status(401).json({ message: "Session expired. Please login again." });
    }

    next();
};

module.exports = authMiddleware;
