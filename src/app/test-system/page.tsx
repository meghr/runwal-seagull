import { prisma } from "@/lib/db";

export default async function SystemStatusPage() {
    const checks = [];

    // 1. Database Connection Check
    try {
        const start = performance.now();
        await prisma.$queryRaw`SELECT 1`;
        const duration = Math.round(performance.now() - start);
        checks.push({
            id: "DB-001",
            name: "Database Connection",
            status: "PASS",
            details: `Connected successfully in ${duration}ms`,
        });
    } catch (error) {
        checks.push({
            id: "DB-001",
            name: "Database Connection",
            status: "FAIL",
            details: String(error),
        });
    }

    // 2. Schema/Env Checks
    const requiredVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
    requiredVars.forEach((varName, index) => {
        const val = process.env[varName];
        checks.push({
            id: `ENV-00${index + 1}`,
            name: `Env Var: ${varName}`,
            status: val ? "PASS" : "FAIL",
            details: val ? "Configured" : "Missing",
        });
    });

    const allPass = checks.every((c) => c.status === "PASS");

    return (
        <div className="min-h-screen bg-slate-50 p-10 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <div className={`p-6 ${allPass ? "bg-green-600" : "bg-red-600"} text-white`}>
                    <h1 className="text-2xl font-bold">System Health Verification</h1>
                    <p className="opacity-90 mt-1">
                        Status: {allPass ? "OPERATIONAL" : "ISSUES DETECTED"}
                    </p>
                </div>

                <div className="p-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                <th className="pb-3 font-semibold">Test ID</th>
                                <th className="pb-3 font-semibold">Scenario</th>
                                <th className="pb-3 font-semibold">Status</th>
                                <th className="pb-3 font-semibold">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checks.map((check) => (
                                <tr key={check.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <td className="py-4 text-slate-600 font-mono text-xs">{check.id}</td>
                                    <td className="py-4 font-medium text-slate-800">{check.name}</td>
                                    <td className="py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${check.status === "PASS"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {check.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-slate-500 text-sm">{check.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-xs text-slate-400 text-right">
                    Generated at {new Date().toISOString()}
                </div>
            </div>
        </div>
    );
}
