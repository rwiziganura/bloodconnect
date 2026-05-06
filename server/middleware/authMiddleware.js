import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  console.log("=== AUTH CHECK ===");
  console.log("Auth header:", header ? "Present" : "MISSING");

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    console.log("==================");

    // Support tokens signed with either `id` or `userId`
    req.user = {
      ...decoded,
      id: decoded.id ?? decoded.userId,
    };
    next();
  } catch (err) {
    console.error("TOKEN ERROR:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
