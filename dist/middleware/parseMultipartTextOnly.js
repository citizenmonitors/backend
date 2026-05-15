import multer from "multer";
/** multer@2 provides `.none()`; typings omit it — double-cast for TS only */
const multipartParser = multer().none();
/**
 * Populates `req.body` from multipart/form-data text fields (Postman form-data, etc.).
 * Skips when Content-Type is not multipart so `application/json` still works with `express.json()`.
 */
export const parseMultipartTextOnly = (req, res, next) => {
    const ct = String(req.headers["content-type"] ?? "").toLowerCase();
    if (ct.includes("multipart/form-data")) {
        return multipartParser(req, res, next);
    }
    next();
};
//# sourceMappingURL=parseMultipartTextOnly.js.map