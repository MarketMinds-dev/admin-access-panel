const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Please check your .env.local file."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  const username = "admin";
  const email = "admin@gmail.com";
  const password = "Rammo2012"; // You should change this to a secure password

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("User")
      .insert([{ username, email, password: hashedPassword, role: "ADMIN" }])
      .select();

    if (error) {
      console.error("Error creating admin user:", error);
    } else {
      console.log("Admin user created successfully:", data[0]);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

createAdminUser();
