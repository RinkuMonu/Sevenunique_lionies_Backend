import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subcategory.modal.js";

/* =========================
   CREATE PRODUCT
========================= */

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      subCategory,
      basePrice,
      discountRate = 0,
      description,
      status = "draft",
      specifications = {},
      returnPolicyDays = 7,
      isNewArrival = true,
      isTopRated = false,
      isTrending = false,
      isBestSelling = false
    } = req.body;
    console.log(req.body)

    /* =====================
       BASIC VALIDATION
    ====================== */
    if (!name || !category || !subCategory || !basePrice || !description) {
      return res.status(400).json({
        success: false,
        message:
          "name, category, subCategory, basePrice and description are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required"
      });
    }

    if (Number(basePrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Base price must be greater than 0"
      });
    }

    if (discountRate < 0 || discountRate > 90) {
      return res.status(400).json({
        success: false,
        message: "Discount rate must be between 0 and 90"
      });
    }

    /* =====================
       CATEGORY VALIDATION
    ====================== */
    const categoryDoc = await Category.findById(category);

    if (!categoryDoc || !categoryDoc.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category"
      });
    }
    const subCategoryDoc = await SubCategory.findOne({
      _id: subCategory,
      category
    });

    if (!subCategoryDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub category for selected category"
      });
    }


    /* =====================
       SPECIFICATIONS VALIDATION
       (CATEGORY DRIVEN)
    ====================== */
    if (typeof specifications !== "object") {
      return res.status(400).json({
        success: false,
        message: "Specifications must be an object"
      });
    }

    // Allowed specs for this category
    const allowedAttributes = categoryDoc.attributeFilters || new Map();

    for (const key of Object.keys(specifications)) {
      if (!allowedAttributes.has(key)) {
        return res.status(400).json({
          success: false,
          message: `Invalid specification key: ${key}`
        });
      }

      const allowedValues = allowedAttributes.get(key);

      if (
        Array.isArray(allowedValues) &&
        !allowedValues.includes(specifications[key])
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid value for ${key}: ${specifications[key]}`
        });
      }
    }

    /* =====================
       CREATE PRODUCT
    ====================== */
    const product = await Product.create({
      name: name.trim(),
      category,
      subCategory,
      description,
      basePrice: Number(basePrice),
      discountRate: Number(discountRate),
      status,
      specifications,
      returnPolicyDays: Number(returnPolicyDays),
      isNewArrival,
      isTopRated,
      isTrending,
      isBestSelling,
      productImage: `/uploads/${req.file.filename}`
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

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
      sort,
      limit,
      mode,
      isTrending,
      isBestSelling,
      isTopRated
    } = req.query;
    const isAdminMode = mode === "admin";

    const productFilter = { isActive: true };
    if (category) productFilter.category = category.toLowerCase();
    if (subCategory) productFilter.subCategory = subCategory.toLowerCase();
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
    if (isTrending == "true") {
      productFilter.isTrending = true;
    }
    if (isBestSelling == "true") {
      productFilter.isBestSelling = true;
    }
    if (isTopRated == "true") {
      productFilter.isTopRated = true;
    }

    const products = await Product.find(productFilter);

    if (products.length === 0) {
      return res.json({ success: true, count: 0, products: [] });
    }

    const productIds = products.map(p => p._id);


    /* =====================
       VARIANT LEVEL FILTER
    ====================== */
    const variantFilter = {
      productId: { $in: productIds },
      isActive: true,
      stock: { $gt: 0 }
    };

    // if (variantFilter) variantFilter.stock = { $gt: 0 };
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
    // console.log("variants", variants)

    if (variants.length === 0) {
      return res.json({ success: true, count: 0, products: [] });
    }

    /* =====================
       MAP PRODUCTS
    ====================== */
    const productMap = {};

    variants.forEach(v => {
      const pid = v.productId.toString();
      if (!productMap[pid]) {
        productMap[pid] = {
          colors: new Set(),
          prices: []
        };
      }
      productMap[pid].colors.add(v.color);
      productMap[pid].prices.push(v.price);
    });

    let result = products
      .filter(p => isAdminMode || productMap[p._id.toString()])
      .map(p => {
        const pid = p._id.toString();
        const variantData = productMap[pid];

        return {
          _id: p._id,
          name: p.name,
          productImage: p.productImage,
          brand: p.brand,
          rating: p.rating,
          discountRate: p.discountRate,
          isNewArrival: p.isNewArrival,
          isTopRated: p.isTopRated,
          isTrending: p.isTrending,
          isBestSelling: p.isBestSelling,

          colors: variantData ? [...variantData.colors] : [],
          startingPrice: variantData
            ? Math.min(...variantData.prices)
            : null,

          hasVariants: Boolean(variantData)
        };
      });

    /* =====================
       SORT
    ====================== */
    if (sort === "price_low") {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    }
    if (sort === "price_high") {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    }
    if (limit) {
      result = result.slice(0, Number(limit));
    }

    return res.json({
      success: true,
      count: result.length,
      products: result
    });

  } catch (error) {
    console.log(error)
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
    let product
    if (req.params.id) {
      product = await Product.findOne({
        _id: req.params.id,
        isActive: true
      });
    } else {
      product = await Product.findOne({
        slug: req.params.slug,
        isActive: true
      });

    }

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

  if (!req.body.color || !req.body.size || !req.body.price || !req.params.productId) {
    return res.status(400).json({ message: "Missing variant fields" });
  }

  const variant = await ProductVariant.create({
    productId: req.params.productId,
    ...req.body
  });
  res.json(variant);
};

export const getFilters = async (req, res) => {
  try {
    const { categoryId } = req.query;

    // 🔹 ALL PRODUCTS PAGE
    if (!categoryId) {
      return res.json({
        success: true,
        filters: {
          allowed: [
            "price",
            "brand",
            "color",
            "size",
            "discount",
            "availability",
            "rating"
          ],
          attributes: {}
        }
      });
    }

    // 🔹 CATEGORY PAGE
    const category = await Category.findById(categoryId).select(
      "allowedFilters attributeFilters"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.json({
      success: true,
      filters: {
        allowed: category.allowedFilters,
        attributes: category.attributeFilters
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch filters"
    });
  }
};
