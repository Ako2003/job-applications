import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCvDownloadUrl } from "@/lib/storage";

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
    const cvTemplate = await db.cVTemplate.findUnique({
      where: { id, userId: user.id },
      select: { storageKey: true, name: true },
    });

    if (!cvTemplate) {
      return NextResponse.json(
        { error: "CV template not found" },
        { status: 404 }
      );
    }

    // Get signed URL and redirect
    const signedUrl = await getCvDownloadUrl(cvTemplate.storageKey);

    return NextResponse.redirect(signedUrl, 302);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("CV download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
