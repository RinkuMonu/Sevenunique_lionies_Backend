import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import userModel from "../models/user.model.js";
import redis from "../middlewares/redis.js";
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
        const token = generateToken(user);

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
   LOGIN USER
   POST /api/auth/login
========================= */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
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
};

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
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
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

        if (req.body.name) updates.name = req.body.name;
        if (req.body.email) updates.email = req.body.email;
        if (req.body.password) updates.password = req.body.password;
        // 👆 password auto-hash hoga (pre hook)

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Profile update failed"
        });
    }
};
