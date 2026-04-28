import { redirect } from "next/navigation";

// Self-signup is disabled. Accounts are provisioned by the admin in
// Supabase. Anyone hitting /signup gets bounced back to /login.
export default function SignupPage() {
  redirect("/login");
}
