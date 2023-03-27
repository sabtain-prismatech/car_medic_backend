const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "customer Id must be required."],
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "vehicle Id must be required."],
    },
    servicesId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Services",
    },
    otherServices: {
      type: [Object],
    },
    productId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "ProductHistory",
    },
    currentMileage: {
      type: Number,
    },
    bestKM: {
      type: Number,
    },
    reminder: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
    },
    total: {
      type: Number,
      required: [true, "Total Amount must be required."],
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
