const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  fs.readdir(`./hisaab`, function (err, files) {
    if (err) return res.status(500).send(err);
    res.render("index", { files: files });
  });
});

app.get("/edit/:filename", (req, res) => {
  fs.readFile(
    `./hisaab/${req.params.filename}`,
    "utf-8",
    function (err, filedata) {
      if (err) return res.status(500).send(err);
      res.render("edit", { filedata, filename: req.params.filename });
    }
  );
});

app.get("/hisaab/:filename", (req, res) => {
  fs.readFile(
    `./hisaab/${req.params.filename}`,
    "utf-8",
    function (err, filedata) {
      if (err) return res.status(500).send(err);
      res.render("hisaab", { filedata, filename: req.params.filename });
    }
  );
});

app.get("/delete/:filename", (req, res) => {
  fs.unlink(`./hisaab/${req.params.filename}`, function (err, filedata) {
    if (err) return res.status(500).send(err);
    res.redirect("/");
  });
});

app.post("/update/:filename", (req, res) => {
  fs.writeFile(
    `./hisaab/${req.params.filename}`,
    req.body.content,
    function (err) {
      if (err) return res.status(500).send(err);
      res.redirect("/");
    }
  );
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/createhisaab", (req, res) => {
  let currentDate = new Date();
  let date = `${currentDate.getDate()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getFullYear()}`;

  // Function to check if the file exists and rename if necessary
  const createUniqueFileName = (
    directory,
    fileName,
    extension,
    callback,
    counter = 0
  ) => {
    let newFileName = counter === 0 ? fileName : `${fileName}(${counter})`;
    let fullPath = path.join(directory, `${newFileName}${extension}`);

    fs.stat(fullPath, (err) => {
      if (err && err.code === "ENOENT") {
        // File does not exist, proceed with this name
        callback(fullPath);
      } else {
        // File exists, increment the counter and try again
        createUniqueFileName(
          directory,
          fileName,
          extension,
          callback,
          counter + 1
        );
      }
    });
  };

  // Use the function to generate a unique file name
  createUniqueFileName("./hisaab", date, ".txt", (uniqueFileName) => {
    fs.writeFile(uniqueFileName, req.body.content, function (err) {
      if (err) return res.status(500).send(err);
      res.redirect("/");
    });
  });
});

app.listen(3000);
