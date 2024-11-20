import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession();

  if (session) {
    return NextResponse.json(session);
  } else {
    return NextResponse.json(null);
  }
}
