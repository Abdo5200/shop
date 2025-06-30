const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  resetToken: String,
  resetTokenExpiration: Date,
});
userSchema.methods.addToCart = async function (product) {
  try {
    //get the product index in the cart array if it exists
    const cartProductIndex = this.cart.items.findIndex((cartPro) => {
      return cartPro.productId.toString() === product._id.toString();
    });
    let newQty = 1;
    //get an array of products in the existing cart
    const updatedCartItems = [...this.cart.items];
    //if not -1 (not exist)
    if (cartProductIndex >= 0) {
      //increase the quantity of the product
      newQty = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQty;
    } else {
      //this means that it doesn't exist so we add the new product
      updatedCartItems.push({
        productId: product._id,
        quantity: newQty,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    this.cart = updatedCart;
    return this.save();
  } catch (err) {
    console.log(err);
  }
};
userSchema.methods.deleteCartItem = async function (prodId) {
  //this will return a cart items array without the specified product in it
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== prodId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};
userSchema.methods.clearCart = async function () {
  this.cart = { items: [] };
  return this.save();
};
module.exports = mongoose.model("User", userSchema);
