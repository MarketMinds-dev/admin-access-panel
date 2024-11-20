import { NextResponse } from "next/server";
import { serverSignIn } from "@/lib/auth-server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const result = await serverSignIn(email, password);

  if (result.success) {
    return NextResponse.json({ success: true, user: result.user });
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 401 }
    );
  }
}
