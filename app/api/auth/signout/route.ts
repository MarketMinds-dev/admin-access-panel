import { NextResponse } from "next/server";
import { serverSignOut } from "@/lib/auth-server";

export async function POST() {
  const result = await serverSignOut();

  if (result.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }
}
