import { registerPushToken, unregisterPushToken, } from "../../services/mobile/pushNotificationService.js";
const errMsg = (e) => (e instanceof Error ? e.message : String(e));
/** POST /profile/push-token — { token, platform } */
export const postPushToken = async (req, res) => {
    try {
        const userId = String(req.user._id);
        const data = await registerPushToken(userId, req.body ?? {});
        return res.status(200).json(data);
    }
    catch (error) {
        const message = errMsg(error);
        if (message.includes("required") || message.includes("Invalid")) {
            return res.status(400).json({ message });
        }
        if (message.includes("not found"))
            return res.status(404).json({ message });
        return res.status(500).json({ message });
    }
};
/** DELETE /profile/push-token — { token } (body optional) */
export const deletePushToken = async (req, res) => {
    try {
        const userId = String(req.user._id);
        const data = await unregisterPushToken(userId, req.body ?? {});
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: errMsg(error) });
    }
};
//# sourceMappingURL=pushTokenController.js.map