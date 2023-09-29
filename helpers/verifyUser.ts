import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(403).send("Please login first");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      email: string;
    };

    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};
