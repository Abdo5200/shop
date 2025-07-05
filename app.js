const fs = require("fs");

const path = require("path");

const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const session = require("express-session");

const MongoDBStore = require("connect-mongodb-session")(session);

const csrf = require("csurf");

const compression = require("compression");

const { S3Client } = require("@aws-sdk/client-s3");

require("dotenv").config();

const errorController = require("./controllers/error");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.henws.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;

require("dotenv").config();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf({});

const flash = require("connect-flash");

const User = require("./models/user");

const multer = require("multer");

const multerS3 = require("multer-s3");

const bcrypt = require("bcryptjs");

const app = express();

const helmet = require("helmet");

const morgan = require("morgan");

app.set("view engine", "ejs");

app.set("views", "views");

const adminRoutes = require("./routes/admin");

const shopRoutes = require("./routes/shop");

const authRoutes = require("./routes/auth");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: async (req, file, cb) => {
//     const date = new Date().toISOString();
//     const hashedDate = (await bcrypt.hash(date, 10)).replace(/[\/\\$]/g, "-");
//     cb(null, hashedDate + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   )
//     cb(null, true);
//   else cb(null, false);
// };

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpg", "image/jpeg"];
  cb(null, allowed.includes(file.mimetype));
};

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: async (req, file, cb) => {
    const date = new Date().toISOString();
    const hash = (await bcrypt.hash(date, 10)).replace(/[\/\\$]/g, "-");
    const filename = `${hash}-${file.originalname}`;
    cb(null, filename);
  },
});

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": [
        "'self'",
        "data:",
        "https://abdo5200-product-images.s3.eu-north-1.amazonaws.com",
      ],
      "script-src": [
        "'self'",
        "https://js.stripe.com",
        "'unsafe-inline'", // Required for Stripe's inline scripts
      ],
      "connect-src": [
        "'self'",
        "https://api.stripe.com",
        "https://checkout.stripe.com",
      ],
      "frame-src": [
        "'self'",
        "https://checkout.stripe.com",
        "https://js.stripe.com",
      ],
      "form-action": ["'self'", "https://checkout.stripe.com"],
    },
  })
);

app.use(compression());

app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));

// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
// );

app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);

app.use(flash());

app.use(async (req, res, next) => {
  try {
    if (!req.session.user) return next();
    const user = await User.findById(req.session.user._id);
    if (!user) return next();
    req.user = user;
    next();
  } catch (err) {
    next(new Error(err));
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);

app.use(shopRoutes);

app.use(authRoutes);

app.use("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log("Uncaught err: ", error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session?.isLoggedIn || false,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(async (result) => {
    console.log("DB Connected");
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
