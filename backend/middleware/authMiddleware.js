import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET missing");
    }
    // First, try to read token from HttpOnly cookie
    let token = req.cookies?.adminToken;

    // If no cookie, fallback to Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Authentication token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        return res.status(401).json({ message: "Unauthorized access" });
    }
};