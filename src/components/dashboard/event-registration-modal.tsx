"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { registerForEvent } from "@/lib/actions/event";
import {
    Calendar,
    MapPin,
    Users,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
} from "lucide-react";

interface TeamMember {
    name: string;
    email: string;
    phone: string;
}

interface EventRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        id: string;
        title: string;
        startDate: Date;
        endDate: Date;
        venue: string | null;
        participationType: string | null;
        maxParticipants: number | null;
        _count: {
            registrations: number;
        };
    };
    onSuccess: () => void;
}

export function EventRegistrationModal({
    isOpen,
    onClose,
    event,
    onSuccess,
}: EventRegistrationModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { name: "", email: "", phone: "" },
    ]);

    const isTeamEvent = event.participationType === "TEAM";
    const spotsRemaining = event.maxParticipants
        ? event.maxParticipants - event._count.registrations
        : null;

    const addTeamMember = () => {
        setTeamMembers([...teamMembers, { name: "", email: "", phone: "" }]);
    };

    const removeTeamMember = (index: number) => {
        if (teamMembers.length > 1) {
            setTeamMembers(teamMembers.filter((_, i) => i !== index));
        }
    };

    const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
        const updated = [...teamMembers];
        updated[index][field] = value;
        setTeamMembers(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate team members for team events
        if (isTeamEvent) {
            const validMembers = teamMembers.filter((m) => m.name.trim());
            if (validMembers.length === 0) {
                setError("Please add at least one team member");
                setLoading(false);
                return;
            }
        }

        const result = await registerForEvent({
            eventId: event.id,
            teamMembers: isTeamEvent ? teamMembers.filter((m) => m.name.trim()) : undefined,
            additionalNotes: additionalNotes || undefined,
        });

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
                // Reset form
                setSuccess(false);
                setTeamMembers([{ name: "", email: "", phone: "" }]);
                setAdditionalNotes("");
            }, 2000);
        } else {
            setError(result.error || "Registration failed");
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {success ? "Registration Successful!" : "Register for Event"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {success
                            ? "You have been successfully registered."
                            : `Complete your registration for ${event.title}`}
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">You're all set!</h3>
                        <p className="text-slate-400">
                            We've registered you for {event.title}. See you there!
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Event Details Summary */}
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                            <h4 className="font-semibold text-white mb-3">{event.title}</h4>
                            <div className="space-y-2 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-sky-400" />
                                    <span>{format(new Date(event.startDate), "EEE, MMM d, yyyy 'at' h:mm a")}</span>
                                </div>
                                {event.venue && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-pink-400" />
                                        <span>{event.venue}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-purple-400" />
                                    <span>
                                        {event._count.registrations} registered
                                        {spotsRemaining !== null && ` • ${spotsRemaining} spots left`}
                                    </span>
                                </div>
                            </div>
                            {event.participationType && (
                                <div className="mt-3">
                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                        {event.participationType === "TEAM" ? "Team Event" : "Individual Event"}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Team Members Section (for team events) */}
                        {isTeamEvent && (
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <Label className="text-white">Team Members</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={addTeamMember}
                                        className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Member
                                    </Button>
                                </div>

                                {teamMembers.map((member, index) => (
                                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-400">Member {index + 1}</span>
                                            {teamMembers.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeTeamMember(index)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <Input
                                                    placeholder="Name *"
                                                    value={member.name}
                                                    onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={member.email}
                                                    onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    placeholder="Phone"
                                                    value={member.phone}
                                                    onChange={(e) => updateTeamMember(index, "phone", e.target.value)}
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Additional Notes */}
                        <div className="space-y-2 mb-6">
                            <Label htmlFor="notes" className="text-white">Additional Notes (Optional)</Label>
                            <textarea
                                id="notes"
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                placeholder="Any special requirements or notes..."
                                className="w-full min-h-[80px] px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-white/10 text-white hover:bg-white/5"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-sky-500 hover:bg-sky-600 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    "Confirm Registration"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
