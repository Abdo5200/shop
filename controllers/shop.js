const { CURSOR_FLAGS } = require("mongodb");

const Product = require("../models/product");

const Order = require("../models/order");

const PDFDocument = require("pdfkit");

const fs = require("fs");

require("dotenv").config();

const path = require("path");


const stripe = require("stripe")(process.env.STRIPE_KEY);


const ITEMS_PER_PAGE = 2;

// const Order = require("../models/order");

const express = require("express");

let errorCall = (err, next) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  next(error);
};

let renderProds = async (req, res, link, path, title) => {
  const page = +req.query.page || 1;

  let totalItems = await Product.find().countDocuments();

  const products = await Product.find()
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

exports.getIndex = async (req, res, next) => {
  try {
    renderProds(req, res, "shop/index", "/", "Shop");
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getProducts = async (req, res, next) => {
  try {
    renderProds(req, res, "shop/product-list", "/products", "All Products");
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getProduct = async (req, res, next) => {
  //? we can use findAll to return an array of products that meets some criteria
  //? but in this case it will return one item
  const prodId = req.params.productId;
  //*this is with mongo/mongoose
  try {
    const product = await Product.findById(prodId);
    res.render("shop/product-detail", {
      //product is an array with one object with a unique id and we want to return one object so [0]
      product: product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
    });
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    const product = await Product.findById(prodId);
    const addedProduct = await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.postCartDelteItem = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    await req.user.deleteCartItem(prodId);
    res.redirect("/cart");
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    let totalPrice = 0;
    products.forEach((p) => {
      totalPrice += p.quantity * p.productId.price;
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: products.map((p) => {
        return {
          price_data: {
            product_data: {
              name: p.productId.title,
              description: p.productId.description,
            },
            unit_amount: p.productId.price * 100,
            currency: "usd",
          },
          quantity: p.quantity,
        };
      }),
      success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
      cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
    });
    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout Page",
      products: products,
      totalSum: totalPrice,
      sessionId: session.id,
    });
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    //this takes the productId in the items array
    //then gets the product object using the id and put the object instead of the id
    //this is useful as we not get the product manually
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((item) => {
      return { quantity: item.quantity, product: { ...item.productId._doc } }; //? this will get all product data using _doc and will spread it
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user._id,
      },
      products: products,
    });
    order.save();
    req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.postOrder = async (req, res, next) => {
  try {
    //this takes the productId in the items array
    //then gets the product object using the id and put the object instead of the id
    //this is useful as we not get the product manually
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((item) => {
      return { quantity: item.quantity, product: { ...item.productId._doc } }; //? this will get all product data using _doc and will spread it
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user._id,
      },
      products: products,
    });
    order.save();
    req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id });
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    });
  } catch (err) {
    errorCall(err, next);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) return errorCall(new Error("No Order found"), next);

    if (order.user.userId.toString() !== req.user._id.toString())
      return errorCall(new Error("Unauthorized Access!"), next);

    const invoiceName = "invoice-" + orderId + ".pdf";

    const invoicePath = path.join("data", "invoices", invoiceName);

    let totalPrice = 0;

    const pdfDoc = new PDFDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));

    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true,
      align: "center",
    });
    pdfDoc.text("------------------------------------------------------");
    order.products.forEach((prod) => {
      const productTotalPrice = prod.product.price * prod.quantity;
      totalPrice += productTotalPrice;
      pdfDoc
        .fontSize(16)
        .text(
          `${prod.product.title} - ${prod.quantity} x $${prod.product.price} = ${productTotalPrice}`
        );
    });
    pdfDoc.text("----------------------------------", {
      align: "center",
    });
    pdfDoc.fontSize(20).text(`Total = ${totalPrice}`, { align: "center" });
    pdfDoc.end();
    // const invoice = fs.readFileSync(invoicePath);
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   'inline; filename = "' + invoiceName + '"'
    // );
    // res.send(invoice);
    //----------------
    // create a readable stream so the data will be read in chuncks
    //instead of as a whole to not cause memory pressaure for large files
    // const file = fs.createReadStream(invoicePath);
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   'inline; filename = "' + invoiceName + '"'
    // );
    //send the chunks from the stream into response
    // file.pipe(res);
  } catch (e) {
    errorCall(e, next);
  }
};
