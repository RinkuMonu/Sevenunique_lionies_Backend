import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema({
  name: {
    type: String, required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    index: true,
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    index: true,
    required: true
  },
  brand: {
    type: String,
    index: true,
    default: "Lionies",
  },
  description: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true

  },
  basePrice: {
    type: Number,
    required: true,
    min: 1
  },
  finalPrice: {
    type: Number
  },// handle by prehook
  discountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 90
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft"
  },
  // specifications: {

  //   fabric: String,
  //   // Example: "100% Cotton", "Denim", "Polyester Blend"

  //   fit: String,
  //   // Example: "Regular Fit", "Slim Fit", "Oversized"

  //   sleeve: String,
  //   // Example: "Full Sleeve", "Half Sleeve", "Sleeveless"

  //   collar: String,
  //   // Example: "Spread Collar", "Mandarin Collar", "Hooded"

  //   pattern: String,
  //   // Example: "Solid", "Checked", "Striped", "Printed"

  //   occasion: String,
  //   // Example: "Casual", "Formal", "Party Wear", "Festive"

  //   washCare: String,
  //   // Example: "Machine Wash", "Hand Wash", "Dry Clean Only"

  //   hemline: String,
  //   // Example: "Straight", "Curved", "High-Low"

  //   closure: String,
  //   // Example: "Button", "Zip", "Drawstring"

  //   numberOfPockets: Number,
  //   // Example: 1, 2, 4

  //   rise: String,
  //   // Example (Jeans/Lower): "Mid Rise", "High Rise", "Low Rise"

  //   transparency: String,
  //   // Example: "Opaque", "Semi-Sheer"

  //   stretch: String,
  //   // Example: "Stretchable", "Non-Stretch"

  //   lining: String,
  //   // Example: "Fully Lined", "Partially Lined", "No Lining"

  //   weaveType: String,
  //   // Example: "Woven", "Knitted"

  //   surfaceStyling: String,
  //   // Example: "Pleated", "Ruffled", "None"

  //   printOrPatternType: String,
  //   // Example: "Graphic Print", "Floral", "Abstract"

  //   cuff: String,
  //   // Example: "Button Cuff", "Elastic Cuff"

  //   pocketType: String
  //   // Example: "Patch Pocket", "Side Pocket", "Welt Pocket"
  // },


  specifications: {
    type: Map,
    of: String
  },
  returnPolicyDays: {
    type: Number,
    default: 7
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isNewArrival: {
    type: Boolean,
    default: true
  },
  isTopRated: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isBestSelling: {
    type: Boolean,
    default: false
  },
  saleCount: {
    type: Number,
    default: 0
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.pre("save", function (next) {
  if (this.isModified("basePrice") || this.isModified("discountRate")) {
    this.finalPrice =
      this.basePrice - (this.basePrice * this.discountRate) / 100;
  }
  next();
});

productSchema.pre("validate", async function (next) {
  if (this.isModified("name")) {

    let baseSlug = slugify(this.name, {
      lower: true,
      strict: true
    });

    let slug = baseSlug;
    let counter = 1;

    const Product = this.constructor;

    while (await Product.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    this.slug = slug;
  }

  next();
});


productSchema.index({ category: 1, subCategory: 1, brand: 1 });
export default mongoose.model("Product", productSchema);
