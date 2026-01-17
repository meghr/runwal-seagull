"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";

interface FileUploadProps {
    onChange: (url: string) => void;
    value: string;
    endpoint?: "image" | "pdf"; // Logic to separate presets if needed
    disabled?: boolean;
}

export const FileUpload = ({
    onChange,
    value,
    endpoint = "image",
    disabled,
}: FileUploadProps) => {
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useState(() => {
        setMounted(true);
    });

    const onUpload = (result: any) => {
        if (result.event !== "success") return;
        onChange(result.info.secure_url);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="mb-4 flex flex-col items-center gap-4">
            {value && endpoint === "image" && (
                <div className="relative h-[200px] w-[200px] overflow-hidden rounded-md">
                    <Image
                        fill
                        src={value}
                        alt="Upload"
                        className="object-cover"
                    />
                    <button
                        onClick={() => onChange("")}
                        className="absolute right-0 top-0 rounded-full bg-red-500 p-1 text-white shadow-sm"
                        type="button"
                    >
                        X
                    </button>
                </div>
            )}

            {value && endpoint === "pdf" && (
                <div className="flex items-center gap-2 rounded-md border p-2 text-sm text-green-600">
                    <span>📄 File Uploaded</span>
                    <button
                        onClick={() => onChange("")}
                        className="text-red-500 hover:text-red-700"
                        type="button"
                    >
                        Remove
                    </button>
                </div>
            )}

            {/* 
        Note: You need to create an Unsigned Upload Preset in Cloudinary
        Settings -> Upload -> Upload presets -> Add upload preset
        Mode: Unsigned
      */}
            <CldUploadWidget
                onSuccess={onUpload}
                uploadPreset="runwal_seagull_preset" // User needs to configure this! 
                options={{
                    maxFiles: 1,
                    resourceType: endpoint === "pdf" ? "raw" : "image",
                    clientAllowedFormats: endpoint === "pdf" ? ["pdf"] : ["png", "jpeg", "jpg", "webp"],
                    maxFileSize: endpoint === "pdf" ? 10000000 : 5000000, // 10MB or 5MB
                }}
            >
                {({ open }) => {
                    return (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => open()}
                            className="rounded bg-sky-500 px-4 py-2 text-white transition hover:bg-sky-600 disabled:opacity-50"
                        >
                            Upload {endpoint === "pdf" ? "Document" : "Image"}
                        </button>
                    );
                }}
            </CldUploadWidget>
        </div>
    );
};
