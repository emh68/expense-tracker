import mongoose from "mongoose";

export default function requireAuth(req, res, next) {
  if (
    !req.isAuthenticated?.() ||
    !mongoose.isObjectIdOrHexString(req.user?._id)
  ) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  next();
}
