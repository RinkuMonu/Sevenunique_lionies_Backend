export const getSellerDashboard = async (req, res) => {
    try {

        const seller = await sellerModal.findOne({ userId: req.user.id || req.user._id, kycStatus: "approved" }).select("_id kycStatus");
        if (!seller) {
            return res.status(404).json({ message: "Seller not found or KYC not approved" });
        }
        const sellerId = seller._id;

        const [
            totalProducts,
            totalOrders,
            deliveredOrders,
            cancelledOrders,
            shippedOrders,
            returnedOrders,
            pendingOrders,
            lowstock,
            revenue,
            wallet
        ] = await Promise.all([
            productModal.countDocuments({ sellerId }),
            orderModal.countDocuments({ sellerId }),
            orderModal.countDocuments({ sellerId, orderStatus: "delivered" }),
            orderModal.countDocuments({ sellerId, orderStatus: "cancelled" }),
            orderModal.countDocuments({ sellerId, orderStatus: "shipped" }),
            orderModal.countDocuments({ sellerId, orderStatus: "returned" }),
            orderModal.countDocuments({ sellerId, orderStatus: { $in: ["placed", "confirmed", "packed"] } }),
            productModal.countDocuments({ sellerId, stock: { $lt: 5 } }),
            orderModal.aggregate([{ $match: { sellerId, paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$sellerAmount" } } }
            ]),
            walletModal.findOne({ ownerId: req.user.id })
        ]);

        res.json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                deliveredOrders,
                cancelledOrders,
                shippedOrders,
                returnedOrders,
                pendingOrders,
                lowstock,
                totalRevenue: revenue[0]?.total || 0,
                walletBalance: wallet?.availableBalance || 0,
                lockedBalance: wallet?.lockedBalance || 0
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
