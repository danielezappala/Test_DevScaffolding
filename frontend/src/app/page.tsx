import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Check if user is authenticated
  // Since we're in DEV_MODE_NO_AUTH, we always redirect to dashboard
  // In production, you would check the session here
  const isAuthenticated = true; // TODO: Check actual auth status

  if (isAuthenticated) {
    redirect("/dashboard");
  } else {
    redirect("/api/v1/auth/login");
  }

  // This will never be reached due to redirect above
  return null;
}
