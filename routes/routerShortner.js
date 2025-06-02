// import { readFile, writeFile } from "fs/promises";
// import path from "path";
import { Router } from "express"; //import router from express
// import { userCollection } from "../Mongo/mongo-driver.js"; //mongoDB
import { db } from "../Mysql/mysql_db.js"; // MySql

const router = Router(); //create instance for router then replace app. => router then export it.

// const DataPath = path.join("Data", "links.json");

const loadlinks = async () => {
  // return userCollection.find().toArray();
  const [data] = await db.execute(
    "select * from shortlinks"
  );
  return data;
};

const savelinks = async ({ url, linkname }) => {
  return await db.execute( "insert into shortlinks(shortcode,url) values(?,?)",[linkname,url])
};
// const loadlinks = async () => {
//   try {
//     const data = await readFile(DataPath, "utf-8");

//     return JSON.parse(data);
//   } catch (error) {
//     if (error.code === "ENOENT") {
//       await writeFile(DataPath, JSON.stringify({}));
//       return {};
//     }
//   }
// };

// const savelinks = async (linkData) => {
//   await writeFile(DataPath, JSON.stringify(linkData));
// };

// router.get("/report", (req, res) => {
//   const data = [
//     {
//       name: "sushant",
//       rollno: 24,
//       class: "tybscit",
//     },
//   ];
//   res.render("report", { data });
// });

router.get("/favicon.ico", (req, res) => res.status(204).end());

router.get("/go/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  try {
    // const findLink = await userCollection.findOne({ linkname: shortcode }); // or use 'shortcode' if the field exists
    const [findLink] = await db.execute(`select url from shortlinks WHERE shortcode="${shortcode}"`); // or use 'shortcode' if the field exists
    console.log(findLink);
    
    if (!findLink) {
      return res.status(404).send("Shortcode not found");
    }

    res.redirect(findLink[0].url);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/", async (req, res) => {
  // res.sendFile(path.join(import.meta.dirname, "index.html"));
  // const file = await readFile(path.join("views", "home.ejs"));

  const links = await loadlinks();

  let isLoggrdIn = req.headers.cookie;

  if (isLoggrdIn) {
    var final = Boolean(isLoggrdIn.split("=")[1]);
  }

  // const content = file.toString().replaceAll(
  //   "{{shorten_url}}",
  //   links
  //     .map(
  //       (data) =>
  //         ` <div class="container" key='${data._id}'>
  //         <a href="${data.linkname}" target="_blank">New : ${data.linkname}</a>
  //         <a>${data.url}</a>
  //       </div>`
  //     )
  //     .join("")
  // );

  // res.send(content,final);

  res.render("home", {
    shorten_url: links,
    final,
  });
});

router.post("/go/:shortcode", async (req, res) => {
  let isLoggrdIn = req.headers.cookie;

  if (isLoggrdIn) {
    var final = Boolean(isLoggrdIn.split("=")[1]);
  }
  if (!final) {
    res.redirect("/login");
  } else {
    const { url, linkname } = req.body;

    // const links = await loadlinks();
    // const findname = await userCollection.findOne({ linkname: linkname });
    const [findname] =await db.execute(
        `select shortcode from shortlinks WHERE shortcode="${linkname}"`
      );
   
    

    if (findname.length > 0) {
      return res
        .status(400)
        .send("Short name already exist. Try some different name");
    }
    // links[linkname] = url;
    await savelinks({ url, linkname });
    console.log("Data saved successfully");
    res.redirect("/");
  }
});

export const ShortnerLink = router;
