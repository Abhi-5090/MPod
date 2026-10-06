const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {

    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    // console.error(err);
                    return res.status(401).json({ message: "User is not authorized" });
                }
                if (decoded !== undefined) {
                    req.user = decoded.user;
                    console.log(req.user);
                    next();
                }
            });
        } else {
            res.status(401).json({ message: "User is not authorized or token is missing" });
        }
    } else {
        res.status(401).json({ message: "Authorization header missing or invalid" });
    }
};

module.exports = validateToken;