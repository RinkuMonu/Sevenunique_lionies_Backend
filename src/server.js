import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoute from "./routes/auth.route.js";
import categoryRoute from "./routes/category.routes.js";
import addvarintRoute from "./routes/addvariantroute.js";
import subcategoryRoute from "./routes/subcategory.js";
import redis from "./middlewares/redis.js";
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", async (req, res) => {
    return res.json({ message: "well-come lionis" });
});
app.get("/health/redis", async (req, res) => {
    if (!redis) {
        return res.json({ redis: "disabled by .env" });
    }
    try {
        const start = Date.now();
        await redis.ping();
        res.json({
            redis: "up",
            latency: `${Date.now() - start}ms`
        });
    } catch {
        res.status(503).json({ redis: "DOWN" });
    }
});

app.use("/uploads", express.static("uploads"));
app.use("/api/product", adminRoutes);
app.use("/api/auth", authRoute);
app.use("/api/category", categoryRoute);
app.use("/api/subcategory", subcategoryRoute);
app.use("/api/variant", addvarintRoute);

export default app;




app.listen(5001, () => console.log("Server running on port 5001"));
