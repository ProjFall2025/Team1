const jwt = require("jsonwebtoken");

// -------------------- VERIFY TOKEN --------------------
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded; // { user_id, email, role }
    next();
  });
};

// -------------------- AUTHORIZE ROLES --------------------
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access forbidden: insufficient permissions" });
    }
    next();
  };
};

// -------------------- TOKEN GENERATION --------------------
exports.generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id, // ✅ critical fix
      email: user.email,
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
