"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventType, ParticipationType } from "@prisma/client";
import { createEvent, updateEvent, EventData } from "@/lib/actions/admin-event";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    ImagePlus,
    X,
    Info,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface EventFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Format date for input
    const formatDateForInput = (date: Date | string | null | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        return format(d, "yyyy-MM-dd'T'HH:mm");
    };

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        eventType: (initialData?.eventType as EventType) || "OTHER",
        startDate: formatDateForInput(initialData?.startDate) || "",
        endDate: formatDateForInput(initialData?.endDate) || "",
        venue: initialData?.venue || "",
        registrationRequired: initialData?.registrationRequired ?? true,
        registrationStartDate: formatDateForInput(initialData?.registrationStartDate) || "",
        registrationEndDate: formatDateForInput(initialData?.registrationEndDate) || "",
        participationType: (initialData?.participationType as ParticipationType) || null,
        maxParticipants: initialData?.maxParticipants?.toString() || "",
        imageUrl: initialData?.imageUrl || "",
        published: initialData?.published || false,
    });

    const [showImageUpload, setShowImageUpload] = useState(false);

    const handleSubmit = async (publish: boolean) => {
        // Validation
        if (!formData.title.trim()) {
            setError("Event title is required");
            return;
        }
        if (!formData.startDate) {
            setError("Start date is required");
            return;
        }
        if (!formData.endDate) {
            setError("End date is required");
            return;
        }

        // Check dates
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end < start) {
            setError("End date must be after start date");
            return;
        }

        // Validate registration dates if required
        if (formData.registrationRequired) {
            if (formData.registrationStartDate && formData.registrationEndDate) {
                const regStart = new Date(formData.registrationStartDate);
                const regEnd = new Date(formData.registrationEndDate);
                if (regEnd < regStart) {
                    setError("Registration end date must be after registration start date");
                    return;
                }
            }
        }

        setLoading(true);
        setError(null);

        const submitData: EventData = {
            title: formData.title,
            description: formData.description || undefined,
            eventType: formData.eventType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            venue: formData.venue || undefined,
            registrationRequired: formData.registrationRequired,
            registrationStartDate: formData.registrationStartDate || null,
            registrationEndDate: formData.registrationEndDate || null,
            participationType: formData.participationType,
            maxParticipants: formData.maxParticipants
                ? parseInt(formData.maxParticipants)
                : null,
            imageUrl: formData.imageUrl || null,
            published: publish,
        };

        try {
            let result;
            if (isEditing && initialData?.id) {
                result = await updateEvent(initialData.id, submitData);
            } else {
                result = await createEvent(submitData);
            }

            if (result.success) {
                router.push("/admin/events");
                router.refresh();
            } else {
                setError(result.error || "Operation failed");
                setLoading(false);
            }
        } catch (e) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const eventTypes: { value: EventType; label: string; color: string }[] = [
        { value: "FESTIVAL", label: "Festival", color: "text-orange-400" },
        { value: "SPORTS", label: "Sports", color: "text-green-400" },
        { value: "CULTURAL", label: "Cultural", color: "text-pink-400" },
        { value: "MEETING", label: "Meeting", color: "text-blue-400" },
        { value: "SOCIAL", label: "Social", color: "text-purple-400" },
        { value: "OTHER", label: "Other", color: "text-slate-400" },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <Link
                    href="/admin/events"
                    className="flex items-center text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Events
                </Link>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 text-slate-300"
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Save Draft"
                        )}
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isEditing && initialData?.published ? (
                            "Update & Publish"
                        ) : (
                            "Publish Event"
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-8">
                {/* Event Basic Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-white">
                        <Calendar className="h-5 w-5 text-pink-400" />
                        Event Details
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">
                            Event Title <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Enter event title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="bg-slate-900/50 border-white/10 text-white text-lg"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">
                            Description
                        </Label>
                        <textarea
                            id="description"
                            placeholder="Describe the event..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                        />
                    </div>

                    {/* Event Type & Venue */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-white">
                                Event Category <span className="text-red-400">*</span>
                            </Label>
                            <Select
                                value={formData.eventType}
                                onValueChange={(value: EventType) =>
                                    setFormData({ ...formData, eventType: value })
                                }
                            >
                                <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                    {eventTypes.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                            className="text-white hover:bg-white/10"
                                        >
                                            <span className={type.color}>{type.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="venue" className="text-white flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                Venue / Location
                            </Label>
                            <Input
                                id="venue"
                                placeholder="e.g., Community Hall, Garden Area"
                                value={formData.venue}
                                onChange={(e) =>
                                    setFormData({ ...formData, venue: e.target.value })
                                }
                                className="bg-slate-900/50 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Event Date/Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-white">
                                Start Date & Time <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="startDate"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                className="bg-slate-900/50 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-white">
                                End Date & Time <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="endDate"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value })
                                }
                                className="bg-slate-900/50 border-white/10 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Registration Settings Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-white">
                        <Users className="h-5 w-5 text-purple-400" />
                        Registration Settings
                    </div>

                    {/* Registration Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/30 border border-white/10">
                        <div>
                            <p className="font-medium text-white">Enable Registration</p>
                            <p className="text-sm text-slate-400">
                                Allow users to register for this event
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setFormData({
                                    ...formData,
                                    registrationRequired: !formData.registrationRequired,
                                })
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 ${formData.registrationRequired
                                ? "bg-gradient-to-r from-pink-500 to-purple-600"
                                : "bg-slate-600"
                                }`}
                            role="switch"
                            aria-checked={formData.registrationRequired}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${formData.registrationRequired
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>

                    {formData.registrationRequired && (
                        <>
                            {/* Registration Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="regStart" className="text-white">
                                        Registration Opens
                                    </Label>
                                    <Input
                                        id="regStart"
                                        type="datetime-local"
                                        value={formData.registrationStartDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                registrationStartDate: e.target.value,
                                            })
                                        }
                                        className="bg-slate-900/50 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="regEnd" className="text-white">
                                        Registration Closes
                                    </Label>
                                    <Input
                                        id="regEnd"
                                        type="datetime-local"
                                        value={formData.registrationEndDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                registrationEndDate: e.target.value,
                                            })
                                        }
                                        className="bg-slate-900/50 border-white/10 text-white"
                                    />
                                </div>
                            </div>

                            {/* Participation Type & Max */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-white">Participation Type</Label>
                                    <Select
                                        value={formData.participationType || "INDIVIDUAL"}
                                        onValueChange={(value: ParticipationType) =>
                                            setFormData({
                                                ...formData,
                                                participationType: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10">
                                            <SelectItem
                                                value="INDIVIDUAL"
                                                className="text-white hover:bg-white/10"
                                            >
                                                Individual
                                            </SelectItem>
                                            <SelectItem
                                                value="TEAM"
                                                className="text-white hover:bg-white/10"
                                            >
                                                Team
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxParticipants" className="text-white">
                                        Max Participants (optional)
                                    </Label>
                                    <Input
                                        id="maxParticipants"
                                        type="number"
                                        min="1"
                                        placeholder="No limit"
                                        value={formData.maxParticipants}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                maxParticipants: e.target.value,
                                            })
                                        }
                                        className="bg-slate-900/50 border-white/10 text-white"
                                    />
                                </div>
                            </div>

                            {/* Info note for team */}
                            {formData.participationType === "TEAM" && (
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <Info className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                                    <div className="text-sm text-purple-300">
                                        <p className="font-medium">Team Registration</p>
                                        <p className="text-purple-400">
                                            Users will be prompted to add team member details when
                                            registering.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Event Image Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-white">
                        <ImagePlus className="h-5 w-5 text-sky-400" />
                        Event Image
                    </div>

                    {formData.imageUrl ? (
                        <div className="relative group">
                            <img
                                src={formData.imageUrl}
                                alt="Event preview"
                                className="w-full max-h-64 object-cover rounded-lg border border-white/10"
                            />
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, imageUrl: "" })}
                                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : !showImageUpload ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowImageUpload(true)}
                            className="border-dashed border-white/20 text-slate-400 hover:text-white w-full py-8"
                        >
                            <ImagePlus className="h-5 w-5 mr-2" />
                            Upload Event Banner
                        </Button>
                    ) : (
                        <div className="p-4 rounded-lg border border-dashed border-white/20 bg-slate-900/30">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-slate-400">
                                    Upload Event Image
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowImageUpload(false)}
                                    className="h-6 w-6 p-0 text-slate-500"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <FileUpload
                                value=""
                                onChange={(url) => {
                                    setFormData({ ...formData, imageUrl: url });
                                    setShowImageUpload(false);
                                }}
                                endpoint="image"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Recommended: 1200x630px. Max size: 5MB. Formats: JPG, PNG, WebP.
                            </p>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            {/* Helpful tip for editing */}
            {isEditing && initialData?._count?.registrations > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-300">
                        <p className="font-medium">
                            This event has {initialData._count.registrations} registration(s)
                        </p>
                        <p className="text-amber-400">
                            Some settings may be restricted to protect existing registrations.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
