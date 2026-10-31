import jwt from "jsonwebtoken";
import prisma from "../db.js";

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const tokenMatch =
    typeof authorization === "string" &&
    authorization.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(tokenMatch[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  if (
    !decoded ||
    typeof decoded !== "object" ||
    !Number.isInteger(decoded.id)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        employee: {
          select: { id: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is unavailable",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export default authMiddleware;
export { authMiddleware as protect };