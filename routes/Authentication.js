import { Router } from "express";
import { db } from "../Mysql/mysql_db.js";

const router = Router();

router.get("/register", (req, res) => {
  res.render("register");
});
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  await db.execute(
    `insert into userdata(username,email,password) values(?,?,?)`,
    [username, email, password]
  );
  res.redirect("/");
});

router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/logout", (req, res) => {
 res.clearCookie("isLoggrdIn", { path: "/" });
 res.redirect("/");
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const [finalcheak] = await db.execute(
    `select username,password from userdata WHERE username="${username}" AND password="${password}"`
  );
  if (finalcheak.length > 0) {
    // res.setHeader("Set-Cookie", "isLoggrdIn=true;path=/;");
    res.cookie("isLoggrdIn", true, { path: "/" });
    res.redirect("/");
  } else {
    res.send("Wrong Username and Password");
  }
});

router.get("/forget", (req, res) => {
  res.render("forget");
});

export const Authentication = router;
