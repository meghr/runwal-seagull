import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl shadow-2xl border border-white/10">
                <div className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-green-500/10 p-3 ring-1 ring-green-500/20">
                            <CheckCircle2 className="h-12 w-12 text-green-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Registration Successful!</h1>
                    <p className="text-slate-400 mb-8">
                        Your account has been created and is currently <span className="text-sky-400 font-semibold text-lg">Pending Approval</span> by the society administration.
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300">
                            You will be able to sign in once an administrator approves your request. This usually takes less than 24 hours.
                        </div>
                        <Link href="/" className="block">
                            <Button className="w-full bg-slate-700 hover:bg-slate-600">
                                Return to Landing Page
                            </Button>
                        </Link>
                        <Link href="/login" className="block">
                            <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                                Go to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
