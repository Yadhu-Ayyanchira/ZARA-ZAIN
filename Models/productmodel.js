const mongoose = require("mongoose");

const productSchemaa = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  idealfor: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  StockQuantity: {
    type: Number,
    required: true,
  },
  Status: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: true,
  },
  is_delete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Product", productSchemaa);
