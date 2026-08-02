import { refreshAuthTokens, revokeRefreshToken, } from "../services/authTokenService.js";
import { verifyUserEmail, resendTokenService, submitRoleFormDetails, authenticateUser, generateResetToken, resetUserPassword, validateTokenService, submitObserverDetails, } from "../services/authService.js";
import { mobileRegister, mobileSelectRole } from "../services/mobile/authService.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const getClientMeta = (req) => ({
    platform: req.body.platform ?? "web",
    deviceId: req.body.deviceId,
    appVersion: req.body.appVersion,
    pushToken: req.body.pushToken,
});
export const register = async (req, res) => {
    try {
        await mobileRegister({
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        }, getClientMeta(req));
        res.status(201).json({
            message: "Registration successful! Please check your email for the verification code."
        });
    }
    catch (err) {
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const verifyEmail = async (req, res) => {
    try {
        await verifyUserEmail(req.body.email, req.body.verificationCode);
        res.status(200).json({ message: 'Email verified successfully.' });
    }
    catch (err) {
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const resendToken = async (req, res) => {
    try {
        const { email } = req.body;
        await resendTokenService(email);
        res.status(200).json({ message: "Verification code resent successfully" });
    }
    catch (error) {
        return res.status(400).json({ error: getErrorMessage(error) });
    }
};
export const pickRole = async (req, res) => {
    try {
        const { email, role } = req.body;
        const result = await mobileSelectRole(email, role);
        res.status(200).json(result);
    }
    catch (err) {
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const submitRoleForm = async (req, res) => {
    try {
        const r = req;
        const { email, ...details } = req.body;
        const file = r.file;
        const { user, isObserverInPollingUnit } = await submitRoleFormDetails({
            email,
            details,
            file,
        });
        res.status(200).json({
            message: "Details submitted successfully. You can now select your role.",
            user,
            isObserverInPollingUnit,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const submitObserverDetailsController = async (req, res) => {
    try {
        const r = req;
        const { email, phoneNumber, bankName, bankAccountNumber, bankAccountName, } = req.body;
        const observerIdFiles = r.files?.["observerId[]"] ?? [];
        const result = await submitObserverDetails({
            email,
            observerIdFiles,
            phoneNumber,
            bankName,
            bankAccountNumber,
            bankAccountName,
        });
        return res.status(200).json({
            message: result.message,
            token: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
            user: result.user,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const signIn = async (req, res) => {
    try {
        const { token, refreshToken, expiresIn, user } = await authenticateUser(req.body);
        res.status(200).json({
            token,
            refreshToken,
            expiresIn,
            user,
            message: "Login successfully",
        });
    }
    catch (err) {
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const refreshSession = async (req, res) => {
    try {
        const tokens = await refreshAuthTokens(req.body.refreshToken, {
            userAgent: req.get("user-agent"),
            deviceId: req.body.deviceId,
        });
        return res.status(200).json({
            ...tokens,
            message: "Token refreshed successfully",
        });
    }
    catch (err) {
        return res.status(401).json({ message: getErrorMessage(err) });
    }
};
export const logout = async (req, res) => {
    try {
        await revokeRefreshToken(req.body.refreshToken);
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const forgotPassword = async (req, res) => {
    try {
        await generateResetToken(req.body.email);
        res.status(200).json({ message: 'Password reset link sent to your email.' });
    }
    catch (err) {
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const resetPassword = async (req, res) => {
    try {
        await resetUserPassword(req.body.token, req.body.password);
        res.status(200).json({ message: 'Password reset successful.' });
    }
    catch (err) {
        return res.status(400).json({ message: getErrorMessage(err) });
    }
};
export const validateUserSession = async (req, res) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res
                .status(401)
                .json({ message: "No token provided, authorization denied" });
        }
        const user = await validateTokenService(token);
        res.status(200).json({ user });
    }
    catch (err) {
        return res.status(401).json({ message: getErrorMessage(err) });
    }
};
//# sourceMappingURL=authController.js.map