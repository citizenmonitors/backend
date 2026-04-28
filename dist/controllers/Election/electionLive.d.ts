import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
/**
 * Unified live results for one election. **Authenticated only** — the route
 * mounts `authMiddleware` before this handler; the `userId` check is a safety net.
 */
export declare const getLiveElectionDetails: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const getOngoingElections: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const getActivityBoardAndNotifications: (_req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=electionLive.d.ts.map