import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignInButton from "@/components/SignInButton";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background)" }}
    >
      <div className="text-center max-w-sm px-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--accent)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 11l3 3L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>
          Focus
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          Your personal daily task OS. Synced with Google Tasks, powered by AI prioritization.
        </p>

        <SignInButton />

        <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
          Sign in with Google to access Google Tasks sync
        </p>
      </div>
    </div>
  );
}
