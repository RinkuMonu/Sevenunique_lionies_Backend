import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Category from "../models/category.model.js";

/* =========================
   CREATE PRODUCT
========================= */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      categoryid,
      basePrice,
      isNewArrival,
      isTopRated
    } = req.body;
    console.log(req.body)

    if (!name || !categoryid || !basePrice) {
      return res.status(400).json({
        success: false,
        message: "Name, category,productImage and basePrice are required"
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "ProductImage  are required"
      });
    }
    let attributes = {};
    if (req.body.attributes) {
      attributes = { ...req.body.attributes };
    }
    // ✅ Category exists check
    const categoryExists = await Category.findOne({
      _id: categoryid,
      isActive: true
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    // ✅ Product create
    const product = await Product.create({
      name,
      category: categoryExists.key,
      basePrice,
      attributes,
      isNewArrival,
      isTopRated,
      productImage: req.file ? `/uploads/${req.file.filename}` : null
    });

    return res.status(201).json({
      success: true,
      productId: product._id,
      product
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Product creation failed"
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      brand,
      color,
      size,
      fabric,
      fit,
      occasion,
      sleeve,
      neck,
      type,
      minPrice,
      maxPrice,
      discount,
      sort
    } = req.query;

    /* =====================
       PRODUCT LEVEL FILTER
    ====================== */
    const productFilter = { isActive: true };

    if (category) productFilter.category = category;
    if (subCategory) productFilter.subCategory = subCategory;
    if (brand) productFilter.brand = brand;

    if (fabric) productFilter["attributes.fabric"] = fabric;
    if (fit) productFilter["attributes.fit"] = fit;
    if (occasion) productFilter["attributes.occasion"] = occasion;
    if (sleeve) productFilter["attributes.sleeve"] = sleeve;
    if (neck) productFilter["attributes.neck"] = neck;
    if (type) productFilter["attributes.type"] = type;

    if (discount) {
      productFilter.discountRate = { $gte: Number(discount) };
    }

    const products = await Product.find(productFilter);
    const productIds = products.map(p => p._id);

    /* =====================
       VARIANT LEVEL FILTER
    ====================== */
    const variantFilter = {
      productId: { $in: productIds },
      isActive: true
    };

    if (variantFilter) variantFilter.stock = { $gt: 0 };
    if (color) variantFilter.color = color;
    if (size) variantFilter.size = size;

    if (minPrice || maxPrice) {
      variantFilter.price = {};
      if (minPrice) variantFilter.price.$gte = Number(minPrice);
      if (maxPrice) variantFilter.price.$lte = Number(maxPrice);
    }

    // if (inStock === "true") {
    //   variantFilter.stock = { $gt: 0 };
    // }

    const variants = await ProductVariant.find(variantFilter);

    /* =====================
       MAP PRODUCTS
    ====================== */
    const productMap = {};

    variants.forEach(v => {
      if (!productMap[v.productId]) {
        productMap[v.productId] = {
          colors: new Set(),
          prices: []
        };
      }
      productMap[v.productId].colors.add(v.color);
      productMap[v.productId].prices.push(v.price);
    });

    let result = products
      .filter(p => productMap[p._id])
      .map(p => ({
        _id: p._id,
        name: p.name,
        productImage: p.productImage,
        brand: p.brand,
        rating: p.rating,
        colors: [...productMap[p._id].colors],
        startingPrice: Math.min(...productMap[p._id].prices)
      }));

    /* =====================
       SORT
    ====================== */
    if (sort === "price_low") {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    }
    if (sort === "price_high") {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    }

    return res.json({
      success: true,
      count: result.length,
      products: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
};



/* =========================
   GET PRODUCT BY ID
   GET /api/products/:id
========================= */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 🔥 Only in-stock variants
    const variants = await ProductVariant.find({
      productId: product._id,
      isActive: true,
      stock: { $gt: 0 }
    });

    return res.status(200).json({
      success: true,
      product,
      variants
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product"
    });
  }
};

/* =========================
   UPDATE PRODUCT
   PUT /api/admin/products/:id
========================= */
export const updateProduct = async (req, res) => {
  try {
    const updates = {
      ...req.body
    };

    // 🔥 attributes normalize (important)
    if (req.body.attributes) {
      updates.attributes = { ...req.body.attributes };
    }

    // 🔥 image update
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
};

/* =========================
   DELETE PRODUCT
   DELETE /api/admin/products/:id
========================= */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
};

export const addVariant = async (req, res) => {
  const variant = await ProductVariant.create({
    productId: req.params.productId,
    ...req.body
  });
  res.json(variant);
};
