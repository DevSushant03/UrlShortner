import { Router } from "express";
import dotenv from "dotenv";
import { db } from "../Mysql/mysql_db.js";
import argon2 from "argon2";
import { registerSchema } from "../validator/auth_validator.js";
import jwt from "jsonwebtoken";
import { creatingToken } from "../Auth_servises/services.js";

const router = Router();
dotenv.config();

router.get("/register", (req, res) => {
  return res.render("register", { error: req.flash("error") });
});

router.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  const userAgent = req.headers["user-agent"];
  if (!result.success) {
    req.flash("error", result.error.errors[0].message);
    return res.redirect("/register");
  }
  const { username, email, password } = result.data;
  try {
    const [emailRows] = await db.execute(
      `SELECT email FROM userdata WHERE email = ?`,
      [email]
    );
    const [usernameRows] = await db.execute(
      `SELECT username FROM userdata WHERE username = ?`,
      [username]
    );

    if (emailRows.length > 0) {
      req.flash("error", "User already exists. Try a different email.");
      return res.redirect("/register");
    }

    if (usernameRows.length > 0) {
      req.flash("error", "User already exists. Try a different username.");
      return res.redirect("/register");
    }

    const hashedPassword = await argon2.hash(password);
    await db.execute(
      `INSERT INTO userdata (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword]
    );
    const [users] = await db.execute(`SELECT * FROM userdata WHERE email = ?`, [
      email,
    ]);
    const user = users[0];

     await creatingToken({user, db, req , res,userAgent});

    return res.redirect("/");
  } catch (error) {
    console.error("Registration Error:", error);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/register");
  }
});
// --------------------------------------------------------------------------------------
router.get("/login", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers["user-agent"];

  try {
    const [users] = await db.execute(`SELECT * FROM userdata WHERE email = ?`, [
      email,
    ]);

    if (users.length === 0) {
      req.flash("error", "User not found. Please try again.");
      return res.redirect("/login");
    }

    const user = users[0];
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    await creatingToken({user, db, req , res,userAgent});

    return res.redirect("/");
  } catch (error) {
    console.error("Login Error:", error);
    req.flash("error", "Login failed. Please try again.");
    return res.redirect("/login");
  }
});
//-------------------------------------------------------------------------------------
router.get("/logout", async (req, res) => {
  let token = req.cookies.access_token;
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  await db.execute("delete from user_sessions WHERE user_id=? ", [decoded.id]);
  res.redirect("/");
});
//-------------------------------------------------------------------------------------
router.get("/forget", (req, res) => {
  res.render("forget");
});

export const Authentication = router;
