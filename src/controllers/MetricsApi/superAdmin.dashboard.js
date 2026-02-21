import orderModal from "../../models/order.modal";
import productModel from "../../models/product.model";
import riderModal from "../../models/roleWiseModal/rider.modal";
import sellerModal from "../../models/roleWiseModal/seller.modal";
import userModal from "../../models/roleWiseModal/user.modal";

export const getSuperAdminDashboard = async (req, res) => {
    try {

        const [
            totalUsers,
            totalCustomers,
            totalSellers,
            totalRiders,
            totalOrders,
            pendingSellerKyc,
            pendingRiderKyc,
            totalProducts,
            todayOrders,
            deliveredOrders,
            canceledOrders,
            shippedOrders,
            returnedOrders,
            pendingOrders,
            totalRevenue,
        ] = await Promise.all([
            userModal.countDocuments(),
            userModal.countDocuments({ role: "customer" }),
            sellerModal.countDocuments(),
            riderModal.countDocuments(),
            orderModal.countDocuments(),
            sellerModal.countDocuments({ kycStatus: "pending" }),
            riderModal.countDocuments({ kycStatus: "pending" }),
            productModel.countDocuments(),
            orderModal.countDocuments({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }),
            orderModal.countDocuments({ orderStatus: "delivered" }),
            orderModal.countDocuments({ orderStatus: "cancelled" }),
            orderModal.countDocuments({ orderStatus: "shipped" }),
            orderModal.countDocuments({ orderStatus: "returned" }),
            orderModal.countDocuments({ sellerId, orderStatus: { $in: ["placed", "confirmed", "packed"] } }),
            orderModal.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCustomers,
                totalSellers,
                totalRiders,
                totalOrders,
                pendingSellerKyc,
                pendingRiderKyc,
                totalProducts,
                todayOrders,
                deliveredOrders,
                canceledOrders,
                shippedOrders,
                returnedOrders,
                pendingOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
            }
        });

    } catch (err) {
        console.error("Error in getSuperAdminDashboard:", err);
        res.status(500).json({ message: err.message });

    }
};
