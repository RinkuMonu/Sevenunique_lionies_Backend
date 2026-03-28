import Address from "../models/address.modal.js";


/**
 * CREATE ADDRESS
 */
export const createAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            label,
            fullName,
            mobile,
            alternateMobile,
            street,
            landmark,
            city,
            state,
            pincode,
            country,
            coordinates,
            isDefault
        } = req.body;

        // If setting default → remove previous default
        if (isDefault) {
            await Address.updateMany(
                { userId },
                { $set: { isDefault: false } }
            );
        }

        const address = await Address.create({
            userId,
            label,
            fullName,
            mobile,
            alternateMobile,
            street,
            landmark,
            city,
            state,
            pincode,
            country,
            location: {
                type: "Point",
                coordinates
            },
            isDefault
        });

        res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: address
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * GET ALL ADDRESSES (USER)
 */
export const getUserAddresses = async (req, res) => {
    try {
        const userId = req.user.id;

        const addresses = await Address.find({
            userId,
            isActive: true
        }).sort({ isDefault: -1, createdAt: -1 });

        res.json({
            success: true,
            count: addresses.length,
            data: addresses
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * GET SINGLE ADDRESS
 */
export const getSingleAddress = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            isActive: true,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            data: address
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * UPDATE ADDRESS
 */
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Handle default switching
        if (updateData.isDefault) {
            await Address.updateMany(
                { userId },
                { $set: { isDefault: false } }
            );
        }

        const address = await Address.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            message: "Address updated",
            data: address
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * DELETE ADDRESS (SOFT DELETE)
 */
export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * SET DEFAULT ADDRESS
 */
export const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        // remove old default
        await Address.updateMany(
            { userId },
            { $set: { isDefault: false } }
        );

        const address = await Address.findByIdAndUpdate(
            addressId,
            { isDefault: true },
            { new: true }
        );

        res.json({
            success: true,
            message: "Default address updated",
            data: address
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};