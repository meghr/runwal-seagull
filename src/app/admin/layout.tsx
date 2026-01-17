import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Protect admin routes
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar />
            <div className="pl-64 min-h-screen">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
