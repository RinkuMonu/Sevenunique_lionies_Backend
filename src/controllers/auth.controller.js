import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import userModel from "../models/user.model.js";
import redis from "../middlewares/redis.js";
import otpModal from "../models/otp.modal.js";
import orderModal from "../models/order.modal.js";
import Wishlist from "../models/wishlist.model.js";
import { deleteLocalFile } from "../config/multer.js";
/* =========================
   JWT TOKEN GENERATOR
========================= */
const generateToken = (user, sessionId) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            email: user.email,
            sessionId
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

/* =========================
   REGISTER USER
   POST /api/auth/register
========================= */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const exists = await User.findOne({ email });
        // console.log(exists)
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }


        const user = await User.create({
            name,
            email,
            password
        });
        const sessionId = crypto.randomUUID();
        const token = generateToken(user, sessionId);

        if (redis) {
            const SESSION_TTL = 60 * 60 * 24 * 7;
            await redis.setex(
                `USER_AUTH_SESSION:${user._id}`,
                SESSION_TTL,
                sessionId
            );
        }


        return res.status(201).json({
            success: true,
            message: "Registration success",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log("resgister", error.message)
        res.status(500).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
};
/* =========================
   VERIFY OTP
   POST /api/auth/verify-otp
========================= */
export const verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({
                success: false,
                message: "Mobile and OTP are required"
            });
        }

        const otpRecord = await otpModal.findOne({ mobile });
        // console.log(otpRecord)

        // if (
        //     !otpRecord ||
        //     otpRecord.otp !== otp ||
        //     otpRecord.expiresAt < new Date()
        // ) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "Invalid or expired OTP"
        //     });
        // }

        let user = await userModel.findOne({ mobile });
        let isNewUser = false;

        // 🔥 NEW USER CASE
        if (!user) {
            user = await userModel.create({
                mobile,
                isProfileComplete: false
            });
            isNewUser = true;
        }

        const sessionId = crypto.randomUUID();
        const token = generateToken(user, sessionId);

        if (redis) {
            const SESSION_TTL = 60 * 60 * 24 * 7;
            await redis.setex(
                `USER_AUTH_SESSION:${user._id}`,
                SESSION_TTL,
                sessionId
            );
        }

        await otpModal.deleteOne({ mobile });

        return res.status(200).json({
            success: true,
            token,
            isNewUser,
            user: {
                id: user._id,
                mobile: user.mobile,
                name: user.name || null,
                email: user.email || null,
                role: user.role
            }
        });

    } catch (error) {
        console.error("VERIFY OTP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "OTP verification failed"
        });
    }
};

/* =========================
   LOGIN USER
   POST /api/auth/login
========================= */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email)
        console.log(password)

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        const user = await userModel.findOne({ email }).select("+password");
        console.log(user)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user not found"
            });
        }


        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const sessionId = crypto.randomUUID();

        const token = generateToken(user, sessionId);
        if (redis) {
            try {
                const SESSION_TTL = 60 * 60 * 24 * 7;
                await redis.setex(
                    `USER_AUTH_SESSION:${user._id}`,// key for idl
                    SESSION_TTL,
                    sessionId
                );
                // console.log("✅ USER_SESSION set in Redis");
            } catch (error) {
                console.error("FAILED TO SET USER_SESSION", error);
            }
        }

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
}

/* =========================
   LOGIN USER
   POST /api/auth/logout
========================= */
export const logout = async (req, res) => {
    try {
        if (redis) {
            await redis.del(`USER_AUTH_SESSION:${req.user.id}`);
        }

        return res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};


/* =========================
   GET PROFILE
   GET /api/auth/me
========================= */
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const redisKey = `USER_PROFILE_LIONESS:${userId}`;

        if (redis) {
            try {
                const cachedProfile = await redis.get(redisKey);
                if (cachedProfile) {
                    return res.status(200).json({
                        success: true,
                        source: "redis",
                        ...JSON.parse(cachedProfile)
                    });
                }
            } catch (err) {
                console.warn("Redis GET failed:", err.message);
            }
        }
        const [user, totalOrder, totalWishList] = await Promise.all([
            User.findById(userId),
            orderModal.countDocuments({ user: userId }),
            Wishlist.countDocuments({ user: userId })
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const responseData = {
            user,
            totalOrder,
            totalWishList
        };

        if (redis) {
            try {
                await redis.setex(
                    redisKey,
                    60 * 60,
                    JSON.stringify(responseData)
                );
            } catch (err) {
                console.warn("Redis SET failed:", err.message);
            }
        }

        return res.status(200).json({
            success: true,
            source: "db",
            ...responseData
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile"
        });
    }
};


/* =========================
   UPDATE PROFILE
   PUT /api/auth/update
========================= */
export const updateProfile = async (req, res) => {
    try {
        const updates = {};

        if (req.body.name) {
            if (!/^[a-zA-Z\s]+$/.test(req.body.name)) {
                return res.status(400).json({
                    success: false,
                    message: "Name can contain only letters"
                });
            }
            updates.name = req.body.name;
        }

        if (req.body.email) {
            if (!/^\S+@\S+\.\S+$/.test(req.body.email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format"
                });
            }
            updates.email = req.body.email;
        }

        if (req.body.mobile) {
            if (!/^[6-9]\d{9}$/.test(req.body.mobile)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid mobile number"
                });
            }
            updates.mobile = req.body.mobile;
        }

        if (req.file) {
            updates.avatar = `/uploads/${req.file.filename}`;
        }
        // if (req.file) {
        //     deleteLocalFile(user.avatar);
        //     updates.avatar = `/uploads/${req.file.filename}`;
        // }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Profile update failed"
        });
    }
};



export const getAllUser = async (req, res) => {
    try {
        const users = await User.find()

        if (!users) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const responseData = {
            users,
        };



        return res.status(200).json({
            success: true,
            ...responseData
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile"
        });
    }
};