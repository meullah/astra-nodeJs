// RUN PACKAGES
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const Blob = require("node-blob");
var query = require("./connect-database");
var fs = require("fs");

// SETUP APP
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

let PRODUCT_ID = 1000;

//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {
  //specify diskStorage (another option is memory)
  storage: multer.diskStorage({
    //specify destination
    destination: function (req, file, next) {
      next(null, "./public/photo-storage");
    },

    //specify the filename to be unique
    filename: function (req, file, next) {
      // console.log(file);
      //get the file mimetype ie 'image/jpeg' split and prefer the second value ie'jpeg'
      const ext = file.mimetype.split("/")[1];
      //set the file fieldname to a unique name containing the original name, current datetime and the extension.
      next(null, file.fieldname + "-" + Date.now() + "." + ext);
    },
  }),

  // filter out and prevent non-image files.
  fileFilter: function (req, file, next) {
    if (!file) {
      next();
    }

    // only permit image mimetypes
    const image = file.mimetype.startsWith("image/");
    if (image) {
      console.log("photo uploaded");
      next(null, true);
    } else {
      console.log("file not supported");
      //TODO:  A better message response to user on failure.
      return next();
    }
  },
};

app.get("/", async (req, res) => {
  console.log("getting products from astra db ...");
  // let products = await query.get_products();
  // console.log(products);
  res.render("index");
});

app.get("/new-product", (req, res) => {
  console.log("add new product");
  res.render("add-product");
});

app.post(
  "/new-product",
  multer(multerConfig).single("prductImage"),
  async function (req, res) {
    if (req.file) {
      const blob = new Blob([req.file.path], { type: `${req.file.mimetype}` });
      // console.log(blob);

      PRODUCT_ID++;
      let productName = req.body.pname;
      let productPrice = req.body.price;
      let productDesc = req.body.desc;
      let productId = PRODUCT_ID;
      query.add_product(
        productId,
        productName,
        productPrice,
        JSON.stringify(blob),
        productDesc
      );

      console.log(req.file.path);
      fs.unlink(req.file.path, (err) => {
        if (err) throw err;
        // if no error, file has been deleted successfully
      });
    }

    //Here is where I could add functions to then get the url of the new photo
    //And relocate that to a cloud storage solution with a callback containing its new url
    //then ideally loading that into your database solution.   Use case - user uploading an avatar...
    res.send(
      'Complete! Please note that files not encoded with an image mimetype are rejected. <a href="/new-product">Add another product</a>'
    );
  }
);

// RUN SERVER
app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
