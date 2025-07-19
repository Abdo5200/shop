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
    const order = await Order.findById(orderId).populate("user");
    if (!order) return errorCall(new Error("No Order found"), next);

    if (order.user.userId.toString() !== req.user._id.toString())
      return errorCall(new Error("Unauthorized Access!"), next);

    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename = "' + invoiceName + '"'
    );

    const pdfDoc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Pipe to file and response
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    // Calculate totals
    let subtotal = 0;
    let tax = 0;
    let totalPrice = 0;

    order.products.forEach((prod) => {
      const productTotalPrice = prod.product.price * prod.quantity;
      subtotal += productTotalPrice;
    });

    tax = subtotal * 0.1; // 10% tax
    totalPrice = subtotal + tax;

    // Header Section
    pdfDoc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("INVOICE", { align: "center" });

    pdfDoc.moveDown(0.5);
    // Company Info
    pdfDoc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#34495e")
      .text("Your E-Commerce Store", { align: "center" })
      .fontSize(10)
      .text("123 Commerce Street", { align: "center" })
      .text("Business City, BC 12345", { align: "center" })
      .text("Phone: (555) 123-4567", { align: "center" })
      .text(`Email: ${process.env.MY_SENDING_EMAIL}`, { align: "center" });

    pdfDoc.moveDown(1);

    // Invoice Details
    // const invoiceDate = new Date().toLocaleDateString("en-US", {
    //   year: "numeric",
    //   month: "long",
    //   day: "numeric",
    // });
    const invoiceDate = order.createdAt.toLocaleDateString();

    pdfDoc.fontSize(10).font("Helvetica-Bold").fillColor("#2c3e50");

    // Left column - Invoice info
    pdfDoc.text("Invoice Number:", 50, 200);
    pdfDoc.text("Invoice Date:", 50, 215);
    pdfDoc.text("Order ID:", 50, 230);

    pdfDoc.font("Helvetica");
    pdfDoc.text(orderId, 150, 200);
    pdfDoc.text(invoiceDate, 150, 215);
    pdfDoc.text(orderId, 150, 230);

    // Right column - Customer info
    pdfDoc.font("Helvetica-Bold");
    pdfDoc.text("Bill To:", 350, 200);
    pdfDoc.font("Helvetica");
    pdfDoc.rect(350, 215, 200, 30).strokeColor("#3498db").lineWidth(1).stroke();
    const billToEmail =
      (order.user.userId && order.user.userId.email) ||
      order.user.email ||
      (req.user && req.user.email) ||
      "N/A";
    pdfDoc.text(billToEmail, 360, 225, { width: 180, align: "left" });

    pdfDoc.moveDown(2);

    // Table Header
    const tableTop = 280;
    const itemCodeX = 50;
    const descriptionX = 100;
    const quantityX = 300;
    const priceX = 350;
    const totalX = 420;

    pdfDoc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .rect(50, tableTop - 20, 500, 20)
      .fill()
      .fillColor("#2c3e50")
      .text("Item", itemCodeX, tableTop - 15)
      .text("Description", descriptionX, tableTop - 15)
      .text("Qty", quantityX, tableTop - 15)
      .text("Price", priceX, tableTop - 15)
      .text("Total", totalX, tableTop - 15);

    // Table Content
    let currentY = tableTop + 10;

    order.products.forEach((prod, index) => {
      const productTotalPrice = prod.product.price * prod.quantity;

      // Alternate row colors
      if (index % 2 === 0) {
        pdfDoc
          .fillColor("#f8f9fa")
          .rect(50, currentY - 5, 500, 20)
          .fill();
      }

      pdfDoc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#2c3e50")
        .text((index + 1).toString(), itemCodeX, currentY)
        .text(prod.product.title, descriptionX, currentY)
        .text(prod.quantity.toString(), quantityX, currentY)
        .text(`$${prod.product.price.toFixed(2)}`, priceX, currentY)
        .text(`$${productTotalPrice.toFixed(2)}`, totalX, currentY);

      currentY += 25;
    });

    // Summary Section
    const summaryY = currentY + 20;
    const summaryLabels = ["Subtotal:", "Tax (10%):", "Total:"];
    const summaryAmounts = [
      `$${subtotal.toFixed(2)}`,
      `$${tax.toFixed(2)}`,
      `$${totalPrice.toFixed(2)}`,
    ];
    const numRows = summaryLabels.length;
    const rowHeight = 20;
    // Draw labels and amounts, left-aligned, no border
    for (let i = 0; i < numRows; i++) {
      pdfDoc.fontSize(10).font("Helvetica-Bold").fillColor("#2c3e50");
      pdfDoc.text(summaryLabels[i], 50, summaryY + i * rowHeight, {
        lineBreak: false,
      });
      pdfDoc.font("Helvetica");
      pdfDoc.text(summaryAmounts[i], 150, summaryY + i * rowHeight, {
        lineBreak: false,
      });
    }

    // Add a decorative line
    pdfDoc
      .strokeColor("#bdc3c7")
      .lineWidth(1)
      .moveTo(50, pdfDoc.page.height - 100)
      .lineTo(550, pdfDoc.page.height - 100)
      .stroke();

    // Footer - always at the bottom of the page
    const centerWidth =
      pdfDoc.page.width - pdfDoc.page.margins.left - pdfDoc.page.margins.right;
    const footerHeight = 42; // 3 lines * 14px
    const bottomY =
      pdfDoc.page.height - pdfDoc.page.margins.bottom - footerHeight;
    pdfDoc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#7f8c8d")
      .text("Thank you for your business!", pdfDoc.page.margins.left, bottomY, {
        align: "center",
        width: centerWidth,
      })
      .text(
        "For questions about this invoice, please contact us at abdelrahman.mamdouh2200@gmail.com",
        pdfDoc.page.margins.left,
        bottomY + 14,
        { align: "center", width: centerWidth }
      )
      .text(
        "Payment is due within 30 days of invoice date.",
        pdfDoc.page.margins.left,
        bottomY + 28,
        { align: "center", width: centerWidth }
      );

    pdfDoc.end();
  } catch (e) {
    errorCall(e, next);
  }
};
