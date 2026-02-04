import Banner from "../models/banner.model.js";
/* =========================
   CREATE BANNER
   POST /api/banner
========================= */
export const createBanner = async (req, res) => {
    try {
        const { bannerName, description, deviceType, position } = req.body;

        if (!bannerName) {
            return res.status(400).json({
                success: false,
                message: "Banner name is required",
            });
        }

        const images =
            req.files?.map((file) => `/uploads/${file.filename}`) || [];

        if (images.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one banner image is required",
            });
        }

        const banner = await Banner.create({
            bannerName,
            description,
            deviceType,
            position,
            images,
            addedBy: req.user.id,
        });

        return res.status(201).json({
            success: true,
            banner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create banner",
        });
    }
};

/* =========================
   GET ALL BANNERS
   GET /api/banner
========================= */
export const getBanners = async (req, res) => {
    try {
        const { deviceType, position } = req.query;

        const filter = { isActive: true };

        if (deviceType) {
            filter.deviceType = { $in: [deviceType, "both"] };
        }

        if (position) {
            filter.position = position;
        }

        const banners = await Banner.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            banners,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch banners",
        });
    }
};

/* =========================
   GET BANNER BY ID
   GET /api/banner/:id
========================= */
export const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            banner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch banner",
        });
    }
};

/* =========================
   UPDATE BANNER
   PUT /api/banner/:id
========================= */
export const updateBanner = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (req.files && req.files.length > 0) {
            updates.images = req.files.map(
                (file) => `/uploads/${file.filename}`
            );
        }

        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            banner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update banner",
        });
    }
};

/* =========================
   DELETE BANNER (SOFT)
   DELETE /api/banner/:id
========================= */
export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete banner",
        });
    }
};