import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function serverSignIn(email: string, password: string) {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      throw new Error("Authentication failed");
    }

    if (!data) {
      throw new Error("User not found");
    }

    const passwordMatch = await bcrypt.compare(password, data.password);

    if (!passwordMatch) {
      throw new Error("Invalid password");
    }

    // Create a session token
    const sessionToken = btoa(
      JSON.stringify({ id: data.id, email: data.email, role: data.role })
    );

    // Set the session token as a cookie
    const cookieStore = await cookies();
    cookieStore.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600, // 1 hour
    });

    return {
      success: true,
      user: { id: data.id, email: data.email, role: data.role },
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function serverSignOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("sessionToken");
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken");
    if (!sessionToken) return null;

    return JSON.parse(atob(sessionToken.value));
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}
