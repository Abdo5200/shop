const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
  title: {
    type: String,
    rquired: true,
  },
  price: {
    type: Number,
    rquired: true,
  },
  description: {
    type: String,
    rquired: true,
  },
  imageUrl: {
    type: String,
    rquired: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
module.exports = mongoose.model("Product", productSchema);
