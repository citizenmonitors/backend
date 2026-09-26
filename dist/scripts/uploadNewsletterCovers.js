import "dotenv/config";
import { ensureNewsletterCoversOnFirebase } from "../utils/newsletterCover.js";
const run = async () => {
    const covers = await ensureNewsletterCoversOnFirebase();
    for (const cover of covers) {
        console.log(`${cover.file}\n  ${cover.url}\n`);
    }
    console.log(`Uploaded ${covers.length} newsletter covers to Firebase Storage.`);
};
run().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=uploadNewsletterCovers.js.map