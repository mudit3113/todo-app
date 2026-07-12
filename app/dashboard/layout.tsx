import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={session.user.name} userImage={session.user.image} />
      <main className="flex-1 p-4 sm:p-6 pb-20 sm:pb-6 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
