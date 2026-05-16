import type { Request } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import { resolveArticleImageUrls } from "../../utils/articleImageUpload.ts";

type MulterFiles = Record<
  string,
  Array<{ buffer: Buffer; mimetype: string; originalname: string }> | undefined
>;

type RequestWithFiles = AuthenticatedRequest & { files?: MulterFiles };

export const buildNewsInsightCreatePayload = async (req: Request) => {
  const r = req as RequestWithFiles;
  const body = req.body as Record<string, unknown>;
  const { thumbnailUrl, heroImageURL } = await resolveArticleImageUrls({
    body,
    files: r.files,
    firebaseFolder: "news-insights",
  });

  return {
    adminId: r.user?._id,
    title: String(body.title ?? ""),
    content: String(body.content ?? ""),
    thumbnailUrl,
    heroImageURL,
    excerpt: body.excerpt !== undefined ? String(body.excerpt) : undefined,
    slug: body.slug !== undefined ? String(body.slug) : undefined,
    publishedAt: body.publishedAt as string | Date | undefined,
    isPublished: body.isPublished,
    notifySubscribers: body.notifySubscribers,
  };
};

export const buildPressCoverageCreatePayload = async (req: Request) => {
  const r = req as RequestWithFiles;
  const body = req.body as Record<string, unknown>;
  const { thumbnailUrl, heroImageURL } = await resolveArticleImageUrls({
    body,
    files: r.files,
    firebaseFolder: "press-coverage",
  });

  return {
    adminId: r.user?._id,
    title: String(body.title ?? ""),
    content: String(body.content ?? ""),
    thumbnail: thumbnailUrl,
    heroImageURL,
    excerpt: body.excerpt !== undefined ? String(body.excerpt) : undefined,
    dateline: body.dateline !== undefined ? String(body.dateline) : undefined,
    slug: body.slug !== undefined ? String(body.slug) : undefined,
    publishedAt: body.publishedAt as string | Date | undefined,
    isPublished: body.isPublished,
    notifySubscribers: body.notifySubscribers,
  };
};
