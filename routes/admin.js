const path = require("path");

const express = require("express");
const Product = require("../models/product");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  isAuth,
  [
    body("title", "Type a title with at least 3 characters long")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Please Provide a price").isFloat(),
    body("description", "type a description between 8 and 400 characters")
      .isLength({ min: 8, max: 400 })
      .trim(),
  ],
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  isAuth,
  isAuth,
  [
    body("title", "Type a title with at least 3 characters long")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Please Provide a price").isFloat(),
    body("description", "type a description between 8 and 400 characters")
      .isLength({ min: 8, max: 400 })
      .trim(),
  ],
  adminController.postEditProduct
);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
