import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { sessionClaims } = await auth();
    const user = await currentUser();

    return NextResponse.json({
      message: "Auth working ✅",
      userId: user?.id,
      role: user?.publicMetadata?.role,
      sessionClaims,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
