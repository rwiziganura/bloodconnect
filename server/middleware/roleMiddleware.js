export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    console.log("=== ROLE CHECK ===");
    console.log("User:", req.user);
    console.log("Required roles:", allowed);
    console.log("User role:", req.user?.role);
    console.log("Has access:", allowed.includes(req.user?.role));
    console.log("==================");

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Your role: "${req.user.role}". Required one of: ${allowed.join(", ")}`,
      });
    }
    next();
  };
}
