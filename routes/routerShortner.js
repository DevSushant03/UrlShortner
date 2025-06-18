// import path from "path";
import { Router } from "express";
import dotenv from "dotenv";
import { db } from "../Mysql/mysql_db.js"; // MySql
import { shortlinksSchema } from "../validator/auth_validator.js";
import { verifyAuth } from "../middleware/auth.js";
import jwt from "jsonwebtoken";

dotenv.config(); //import router from express
const router = Router(); //create instance for router then replace app. => router then export it.

const loadlinks = async (userId) => {
  // return userCollection.find().toArray();
  const [data] = await db.execute("select * from shortlinks WHERE user_id=?", [
    userId,
  ]);
  return data;
};

const savelinks = async ({ url, shortcode, userId }) => {
  return await db.execute(
    "insert into shortlinks(shortcode,url,user_id) values(?,?,?)",
    [shortcode, url, userId]
  );
};
// =================================================================================
router.get("/favicon.ico", (req, res) => res.status(204).end());

router.get("/go/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  try {
    // const findLink = await userCollection.findOne({ linkname: shortcode }); // or use 'shortcode' if the field exists
    const [findLink] = await db.execute(
      `select url from shortlinks WHERE shortcode="${shortcode}"`
    ); // or use 'shortcode' if the field exists

    if (!findLink) {
      return res.status(404).send("Shortcode not found");
    }

    res.redirect(findLink[0].url);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
// ===========================================================================================
router.get("/", async (req, res) => {
  let token = req.cookies.access_token;

  let refreshtoken = req.cookies.refresh_token;

  let links = [];

  if (token) {
    try {
      const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

      links = await loadlinks(tokenDecoded.id);
    } catch (err) {
      console.log("JWT error:", err.message);
    }
  } else if (refreshtoken) {
    const { sessionId } = jwt.verify(refreshtoken, process.env.JWT_SECRET);

    const [users] = await db.execute(`SELECT * FROM user_sessions WHERE id=?`, [
      sessionId,
    ]);

    const [userdata] = await db.execute(`SELECT * FROM userdata WHERE id = ?`, [
      users[0].user_id,
    ]);
    const accessToken = jwt.sign(
      {
        id: userdata[0].id,
        username: userdata[0].username,
        email: userdata[0].email,
        sessionId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    token = accessToken;
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "strict",
      secure: process.env.JWT_SECRET,
    });
    links = await loadlinks(userdata[0].id);
  }
  res.render("home", {
    shorten_url: links,
    token,
    error: req.flash("error"),
  });
});
// =================================================================================================
router.post("/go/:shortcode", verifyAuth, async (req, res) => {
  const token = req.cookies.access_token;
  console.log("access token :", token);

  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const result = shortlinksSchema.safeParse(req.body);
    if (!result.success) {
      req.flash("error", result.error.errors[0].message);
      return res.redirect("/");
    }

    const { shortcode, url } = result.data;
    const [findname] = await db.execute(
      `select shortcode from shortlinks WHERE shortcode="${shortcode}"`
    );
    if (findname.length > 0) {
      req.flash("error", "Shortcode already exists");
      return res.redirect("/");
    }

    await savelinks({ url, shortcode, userId });
    console.log("Data saved");
    res.redirect("/");
  } catch (err) {
    return res.redirect("/login");
  }
});

router.get("/edit/:id", async (req, res) => {
  const id = req.params.id;

  const [data] = await db.execute(`select * from shortlinks WHERE id="${id}"`);

  if (!data) {
    res.send("Internal server error");
  } else {
    res.render("editShortlinks", {
      id: data[0].id,
      url: data[0].url,
      shortcode: data[0].shortcode,
    });
  }
});
router.post("/edit/:id", async (req, res) => {
  const id = req.params.id;

  const parsed = shortlinksSchema.safeParse(req.body);

  if (!parsed.success) {
    // If validation fails
    console.log(parsed.error);
    return res.status(400).send("Validation error");
  }

  const data = parsed.data;

  await db.execute(
    `UPDATE shortlinks SET shortcode = ?, url = ? WHERE id = ?`,
    [data.shortcode, data.url, id]
  );
  res.redirect("/");
});

router.get("/delete/:id", async (req, res) => {
  const id = req.params.id;

  await db.execute("delete from shortlinks WHERE id=?", [id]);
  res.redirect("/");
});

router.get("/profile", verifyAuth, async (req, res) => {
  let token = req.cookies.access_token;
  const userinfo = jwt.verify(token, process.env.JWT_SECRET);

  res.render("profile", {
    token,
    userinfo,
  });
});

export const ShortnerLink = router;
