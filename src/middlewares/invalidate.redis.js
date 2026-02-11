import redis from "./redis";

export const invalidateUserProfileCache = async (userId) => {
    if (!redis || !userId) return;
    const redisKey = `USER_PROFILE_LIONESS:${userId}`;
    try {
        await redis.del(redisKey);
        console.log(`🧹 Redis cache cleared for ${redisKey}`);
    } catch (error) {
        console.warn("⚠️ Redis cache invalidation failed:", error.message);
    }
};
