import { registerUser, verifyUserEmail, submitRoleFormDetails, authenticateUser, generateResetToken, resetUserPassword, } from "../services/authService.js";
import multer from "../config/multer.js";
// Register User
export const register = async (req, res) => {
    try {
        await registerUser(req.body);
        res.status(201).json({
            message: "Registration successful! Please check your email to verify your account.",
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(400).json({ message });
    }
};
// Verify Email
export const verifyEmail = async (req, res) => {
    try {
        const token = req.query.token;
        const role = req.query.role;
        if (typeof token !== "string" || typeof role !== "string") {
            return res.status(400).json({ message: "Invalid verification request" });
        }
        await verifyUserEmail(token, role);
        res.redirect(`${process.env.FRONTEND_URL}/step-2?role=${role}`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(400).json({ message });
    }
};
// Submit Role Form
export const submitRoleForm = [
    multer.single("governmentId"),
    async (req, res) => {
        try {
            const { email, role } = req.body;
            const details = req.body;
            const r = req;
            const file = r.file;
            await submitRoleFormDetails({ email, role, details, file });
            res.status(200).json({ message: "Details submitted successfully." });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            res.status(400).json({ message });
        }
    },
];
// User Sign In
export const signIn = async (req, res) => {
    try {
        const token = await authenticateUser(req.body);
        res.status(200).json({ token });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(400).json({ message });
    }
};
// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        await generateResetToken(req.body.email);
        res
            .status(200)
            .json({ message: "Password reset link sent to your email." });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(400).json({ message });
    }
};
// Reset Password
export const resetPassword = async (req, res) => {
    try {
        await resetUserPassword(req.body.token, req.body.password);
        res.status(200).json({ message: "Password reset successful." });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(400).json({ message });
    }
};
//# sourceMappingURL=authController2.js.map