const {
  ProductBuying,
  ProductSaling,
  ProductHistory,
} = require("../models/model.product");
const responseStatus = require("../helpers/status");

// For-Buy-Product
const createBuyingMiddle = async (req, res, next) => {
  try {
    const { name } = req.body;
    const findProduct = await ProductBuying.findOne({ name }, null, {
      runValidators: true,
    });
    if (findProduct) {
      res
        .status(409)
        .json(responseStatus(false, "conflict", "Product Name already exist."));
    } else {
      next();
    }
  } catch (error) {
    res.status(404).json(responseStatus(false, "not-found", `${error}`));
  }
};

// For-Sale-Product
const createSelingMiddle = async (req, res, next) => {
  try {
    let {
      customerName,
      name,
      description,
      buyPrice,
      salePrice,
      discount,
      productId,
      quantity,
    } = req.body;
    const findProduct = await ProductBuying.findOne({ _id: productId });
    if (quantity <= findProduct.quantity.toString()) {
      // Deduct-quantity-from-Buy-table
      await ProductBuying.findByIdAndUpdate(
        { _id: productId },
        { quantity: findProduct.quantity.toString() - quantity }
      );
      let totalSale = salePrice * quantity - discount;
      let totalBuy = buyPrice * quantity;
      let profit = totalSale - totalBuy;
      // Create-Product-History
      const createHistory = await new ProductHistory({
        customerName,
        name,
        description,
        quantity,
        buyPrice,
        salePrice,
        discount,
        productId,
        profit,
      }).save();
      if (createHistory) {
        next();
      }
    } else {
      res
        .status(400)
        .json(
          responseStatus(
            false,
            "bad",
            "Please enter a quantity less than or equal to stock."
          )
        );
    }
  } catch (error) {
    res.status(404).json(responseStatus(false, "not-found", `${error}`));
  }
};

// For-Return_product
const returnProductMiddle = async (req, res, next) => {
  try {
    const { quantity, productId, saleHistoryId } = req.body;

    // delete-History
    await ProductHistory.findByIdAndDelete({
      _id: saleHistoryId,
    });
    // Add-quantity-in-Buy-table
    await ProductBuying.findByIdAndUpdate(
      { _id: productId },
      {
        $inc: {
          quantity: quantity,
        },
      }
    );
    next();
  } catch (error) {
    res.status(404).json(responseStatus(false, "not-found", `${error}`));
  }
};

// Product-Stock-Middleware
const productStockMiddle = async (req, res, next) => {
  try {
    const allStock = await ProductBuying.find(
      {},
      {
        name: 0,
        description: 0,
        _id: 0,
        quantity: 0,
        salePrice: 0,
        productType: 0,
        createdAt: 0,
        updatedAt: 0,
      }
    );

    let stockAmount = 0;
    // loop-for-calculate-all-stock-Price
    for (let i = 0; i < allStock.length; i++) {
      stockAmount = stockAmount + allStock[i].price;
    }
    req.body = { stockAmount };
    next();
  } catch (error) {
    res.status(404).json(responseStatus(false, "not-found", `${error}`));
  }
};

module.exports = {
  createBuyingMiddle,
  createSelingMiddle,
  returnProductMiddle,
  productStockMiddle,
};
