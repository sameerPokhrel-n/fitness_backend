import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/jwt.service";

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
   

  const { accessToken } = req.cookies;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token provided' });
  }
    
    const decoded = verifyAccessToken(accessToken) as any;;
    req.user = decoded;
    next();

     // const auth = req.headers.authorization;
    // if (!auth || !auth.startsWith("Bearer ")) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }
    // const token = auth.split(" ")[1];
    // const payload = verifyAccessToken(token) as any;
    // req.user = payload;
 
 
 
 
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err });
  }
};
