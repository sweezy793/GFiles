const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const multer = require("multer");

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride("_method"));

app.set("view engine", "ejs");

//Mongo URI
const mongoURI = "mongodb://sarthak:abc123@ds249127.mlab.com:49127/gridfs";

//Create mongo connection
const conn = mongoose.createConnection(mongoURI);

let gfs;

conn.once("open", () => {
  //Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

//Create storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

//@route GET/
//@desc Loads form
app.get("/", (req, res) => {
  res.render("index");
});

//@route POST /upload
//@desc Uploads file to DB

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
