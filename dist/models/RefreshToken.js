import mongoose from "mongoose";
const refreshTokenSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByHash: { type: String, default: null },
    userAgent: { type: String, default: null },
    deviceId: { type: String, default: null },
}, { timestamps: true });
// TTL: Mongo deletes the doc when expiresAt is reached
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("RefreshToken", refreshTokenSchema);
//# sourceMappingURL=RefreshToken.js.map