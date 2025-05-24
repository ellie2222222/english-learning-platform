// types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      isProtectedRoute: boolean,
      userInfo: {
        userId: string,
        email: string,
        role: number,
      }
    }
  }
}
