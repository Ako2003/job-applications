import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDocumentDownloadUrl } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    // Verify ownership
    const document = await db.document.findUnique({
      where: { id, userId: user.id },
      select: { storageKey: true, name: true },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get signed URL and redirect
    const signedUrl = await getDocumentDownloadUrl(document.storageKey);

    return NextResponse.redirect(signedUrl, 302);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Document download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
