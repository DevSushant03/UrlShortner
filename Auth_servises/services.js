import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
export const creatingToken = async ({user,db ,res,req,userAgent})=>{
     const [sessionResult] = await db.execute(
          `INSERT INTO user_sessions (user_id, ip, user_agent) VALUES (?, ?, ?)`,
          [user.id, req.clientIp, userAgent]
        );
    
        const sessionId = sessionResult.insertId;
    
        const accessToken = jwt.sign(
          { id: user.id, username: user.username, email: user.email, sessionId },
          process.env.JWT_SECRET, // Move to env variable in production
          { expiresIn: "15m" }
        );
    
        const refreshToken = jwt.sign({ sessionId }, process.env.JWT_SECRET, {
          expiresIn: "5d",
        });
        res.cookie("access_token", accessToken, {
          httpOnly: true,
          path: "/",
          maxAge: 15 * 60 * 1000, // 15 minutes
          sameSite: "strict",
          secure: process.env.JWT_SECRET,
        });
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "strict",
          secure: process.env.JWT_SECRET,
        });
}