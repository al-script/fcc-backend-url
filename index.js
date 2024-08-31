// init project
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// basic config and routing
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// listen for requests
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// log requests in console
app.use("/", function (req, res, next) {
  console.log("+++");
  console.log(req.method + " " + req.path + " - " + req.ip);
  console.log("---");
  next();
});

// define URL Schema
let urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
});

// define URL Model
let Url = mongoose.model("Url", urlSchema);

// handle url shortener form request
app.post("/api/shorturl", function (req, res) {
  console.log("+++");
  let originalUrl = req.body.url;

  // https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/
  const isValidUrl = (urlString) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (e) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  };

  console.log("Original URL:", originalUrl);
  console.log("Is valid URL:", isValidUrl(originalUrl));

  if (!isValidUrl(originalUrl)) {
    res.json({ error: "invalid url" });
  } else {
    const createAndSaveUrl = (done) => {
      console.log("creating url for:", originalUrl);
      let newUrl = new Url({
        url: originalUrl,
      });
      newUrl.save(function (err, data) {
        if (err) return console.error(err);
        res.json({ original_url: originalUrl, short_url: data._id });
      });
    };
    createAndSaveUrl();
  }
  console.log("---");
});

// handle short_url API request
app.get("/api/shorturl/:short_url", function (req, res) {
  console.log("+++");
  let shortUrl = req.params.short_url;
  console.log("shortUrl:", shortUrl);
  console.log("type:", typeof shortUrl);
  const checkShortUrlId = (shortUrl, done) => {
    console.log("shortUrl:", shortUrl);
    Url.findById({ _id: shortUrl }, function (err, data) {
      if (err) return res.json({ error: "invalid url" });
      let redirectUrl = data.url;
      res.redirect(redirectUrl);
    });
  };
  checkShortUrlId(shortUrl);
  console.log("---");
});
