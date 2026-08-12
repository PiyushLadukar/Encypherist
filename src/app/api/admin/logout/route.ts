import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, ADMIN_COOKIE_NAME } from "@/lib/fake-auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  destroySession(token);
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
