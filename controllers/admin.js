const { query } = require("express");
const Product = require("../models/product");
const mongoose = require("mongoose");
const fileHelper = require("../util/file");
const { validationResult } = require("express-validator");

const ITEMS_PER_PAGE = 2;
let errorCall = (err, next) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
};

let renderProds = async (req, res, link, path, title, userId) => {
  const page = +req.query.page || 1;
  let totalItems = await Product.find({ userId: userId }).countDocuments();
  const products = await Product.find({ userId: userId })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  res.render(link, {
    prods: products,
    pageTitle: title,
    path: path,
    currentPage: page,
    hasNextPage: totalItems > page * ITEMS_PER_PAGE,
    hasPreviousPage: page > 1 ? true : false,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    product: { title: "", imageUrl: "", price: undefined, description: "" },
    hasError: false,
    editing: false,
    errorMessage: null,
    validationErrors: [],
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.postAddProduct = async (req, res, next) => {
  try {
    //take the product details from request body
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if (!image) {
      return res.status(422).render("admin/edit-product", {
        path: "/admin/add-product",
        pageTitle: "Add Product",
        product: {
          title: title,
          price: price,
          description: description,
        },
        hasError: true,
        editing: false,
        errorMessage: "Attached file is not an image",
        validationErrors: [],
      });
    }
    const imageUrl = image.path;
    //create a new product object from Product Schema
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        path: "/admin/add-product",
        pageTitle: "Add Product",
        product: {
          title: title,
          price: price,
          description: description,
        },
        hasError: true,
        editing: false,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
    const product = new Product({
      title: title,
      imageUrl: imageUrl,
      price: price,
      description: description,
      userId: req.user,
    });
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getEditProduct = async (req, res, next) => {
  //checks first if it was called with correct way or someone typed a query
  const editMode = Boolean(req.query.edit);
  //if someone forced it return to main page
  if (!editMode) return res.redirect("/");
  const prodId = req.params.productId;
  try {
    //get the product object
    const product = await Product.findOne({
      _id: prodId,
      userId: req.user._id,
    });
    //if it does not exist then someone called edit in the url and added a fake id
    if (!product) return res.redirect("/");
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
      productId: prodId,
    });
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.postEditProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImage = req.file;
    const updatedDescription = req.body.description;
    const product = await Product.findOne({
      _id: prodId,
      userId: req.user._id,
    });
    if (!product) {
      return res.redirect("/");
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        path: "/admin/edit-product",
        pageTitle: "Add Product",
        product: {
          title: updatedTitle,
          price: updatedPrice,
          description: updatedDescription,
          _id: prodId,
        },
        hasError: true,
        editing: true,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
        productId: prodId,
      });
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDescription;
    if (updatedImage) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = updatedImage.path;
    }
    product.save();
    res.redirect("/admin/products");
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) errorCall(new Error("Product does not exist"), next);
    fileHelper.deleteFile(product.imageUrl);
    await Product.deleteOne({
      _id: prodId,
      userId: req.user._id,
    });
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ message: "deleting product failed" });
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getProducts = async (req, res, next) => {
  try {
    renderProds(
      req,
      res,
      "admin/products",
      "/admin/products",
      "Admin Products",
      req.user._id
    );
  } catch (err) {
    errorCall(err, next);
  }
};
