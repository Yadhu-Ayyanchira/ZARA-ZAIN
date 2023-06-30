const mongoose = require("mongoose");
const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "user",
  },
  userName: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
        ref: "Product",
      },
    },
  ],
});

module.exports = mongoose.model("wishlist", wishlistSchema);
