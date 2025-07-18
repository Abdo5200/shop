const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const isAuth = require("../middleware/is-auth");
const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", (req, res) => {
  res.redirect("/");
});

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDelteItem);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);

router.get("/checkout/cancel", isAuth, shopController.getCheckout);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
