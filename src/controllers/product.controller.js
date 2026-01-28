import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  const variants = await ProductVariant.find({
    productId: product._id,
    stock: { $gt: 0 }
  });
  res.json({ product, variants });
};
