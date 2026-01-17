"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NoticeType, Visibility } from "@prisma/client";
import { createNotice, updateNotice, NoticeData } from "@/lib/actions/admin-notice";
import { RichTextEditor } from "./rich-text-editor";
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
import { Loader2, ArrowLeft, Paperclip, X } from "lucide-react";
import Link from "next/link";

interface NoticeFormProps {
    initialData?: any; // Using any for simplicity with Prisma types, or strictly typed
    isEditing?: boolean;
}

export function NoticeForm({ initialData, isEditing = false }: NoticeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<NoticeData>({
        title: initialData?.title || "",
        content: initialData?.content || "",
        noticeType: initialData?.noticeType || "GENERAL",
        visibility: initialData?.visibility || "PUBLIC",
        published: initialData?.published || false,
        attachmentUrls: initialData?.attachmentUrls || [],
    });

    const [showUpload, setShowUpload] = useState(false);

    const handleSubmit = async (publish: boolean) => {
        if (!formData.title.trim()) {
            setError("Title is required");
            return;
        }
        if (!formData.content.trim() || formData.content === "<p></p>") {
            setError("Content is required");
            return;
        }

        setLoading(true);
        setError(null);

        const submitData = { ...formData, published: publish };

        try {
            let result;
            if (isEditing && initialData?.id) {
                result = await updateNotice(initialData.id, submitData);
            } else {
                result = await createNotice(submitData);
            }

            if (result.success) {
                router.push("/admin/notices");
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

    const addAttachment = (url: string) => {
        if (url) {
            setFormData(prev => ({
                ...prev,
                attachmentUrls: [...(prev.attachmentUrls || []), url]
            }));
            setShowUpload(false);
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            attachmentUrls: prev.attachmentUrls?.filter((_, i) => i !== indexToRemove)
        }));
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/notices"
                    className="flex items-center text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Notices
                </Link>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 text-slate-300"
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
                    </Button>
                    <Button
                        className="bg-sky-500 hover:bg-sky-600 text-white"
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing && initialData?.published ? "Update & Publish" : "Publish Notice")}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input
                        id="title"
                        placeholder="Enter notice title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-slate-900/50 border-white/10 text-white text-lg"
                    />
                </div>

                {/* Type & Visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-white">Notice Type</Label>
                        <Select
                            value={formData.noticeType}
                            onValueChange={(value: NoticeType) => setFormData({ ...formData, noticeType: value })}
                        >
                            <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="GENERAL">General Announcement</SelectItem>
                                <SelectItem value="URGENT">Urgent Alert</SelectItem>
                                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                <SelectItem value="EVENT">Event Info</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white">Visibility</Label>
                        <Select
                            value={formData.visibility}
                            onValueChange={(value: Visibility) => setFormData({ ...formData, visibility: value })}
                        >
                            <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="PUBLIC">Public (Everyone)</SelectItem>
                                <SelectItem value="REGISTERED">Registered Users Only</SelectItem>
                                <SelectItem value="ADMIN">Admins Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-2">
                    <Label className="text-white">Content</Label>
                    <RichTextEditor
                        content={formData.content}
                        onChange={(html) => setFormData({ ...formData, content: html })}
                        placeholder="Write the details of the notice..."
                        className="bg-slate-900/50"
                    />
                </div>

                {/* Attachments */}
                <div className="space-y-3">
                    <Label className="text-white">Attachments</Label>

                    {/* List existing */}
                    {formData.attachmentUrls && formData.attachmentUrls.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 mb-3">
                            {formData.attachmentUrls.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded bg-slate-900/50 border border-white/10">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Paperclip className="h-4 w-4 text-sky-400 shrink-0" />
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:underline truncate">
                                            {url.split('/').pop()}
                                        </a>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAttachment(idx)}
                                        className="text-slate-400 hover:text-red-400"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add New */}
                    {!showUpload ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowUpload(true)}
                            className="border-dashed border-white/20 text-slate-400 hover:text-white w-full"
                        >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Add Attachment
                        </Button>
                    ) : (
                        <div className="p-4 rounded-lg border border-dashed border-white/20 bg-slate-900/30">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-400">Upload File (Image or PDF)</span>
                                <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)} className="h-6 w-6 p-0 text-slate-500">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <FileUpload
                                value=""
                                onChange={addAttachment}
                                endpoint="pdf" // Using PDF endpoint to allow both images and pdfs logic from file-upload props
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Supported formats: PDF, PNG, JPG. Max size: 10MB.
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
        </div>
    );
}
