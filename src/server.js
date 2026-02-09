import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoute from "./routes/auth.route.js";
import categoryRoute from "./routes/category.routes.js";
import addvarintRoute from "./routes/addvariantroute.js";
import subcategoryRoute from "./routes/subcategory.js";

import orderRoutes from "./routes/order.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import faqRoutes from "./routes/faq.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";


dotenv.config();
connectDB();


const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); 
app.use("/api/product", adminRoutes);
app.use("/api/auth", authRoute);
app.use("/api/category", categoryRoute);
app.use("/api/subcategory", subcategoryRoute);
app.use("/api/variant", addvarintRoute);

app.use("/api/order", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupon", couponRoutes);


export default app;


app.listen(5000, () => console.log("Server running on port 5000"));
