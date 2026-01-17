"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Unlink,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-white/5 rounded-t-lg">
            <Button
                type="button"
                variant={editor.isActive("bold") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className="h-8 w-8 p-0"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive("italic") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 w-8 p-0"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive("strike") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className="h-8 w-8 p-0"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive("code") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className="h-8 w-8 p-0"
            >
                <Code className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-white/20 mx-1 self-center" />

            <Button
                type="button"
                variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className="h-8 w-8 p-0"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className="h-8 w-8 p-0"
            >
                <Heading3 className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-white/20 mx-1 self-center" />

            <Button
                type="button"
                variant={editor.isActive("bulletList") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className="h-8 w-8 p-0"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive("orderedList") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className="h-8 w-8 p-0"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive("blockquote") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className="h-8 w-8 p-0"
            >
                <Quote className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-white/20 mx-1 self-center" />

            <Button
                type="button"
                variant={editor.isActive("link") ? "default" : "ghost"}
                size="sm"
                onClick={setLink}
                className="h-8 w-8 p-0"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            {editor.isActive("link") && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    className="h-8 w-8 p-0"
                >
                    <Unlink className="h-4 w-4" />
                </Button>
            )}

            <div className="flex-1" />

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-8 w-8 p-0"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-8 w-8 p-0"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
};

export function RichTextEditor({
    content,
    onChange,
    placeholder = "Start writing...",
    className,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-sky-400 hover:underline cursor-pointer",
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: "prose prose-sm prose-invert max-w-none p-4 min-h-[200px] focus:outline-none bg-white/5 rounded-b-lg",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // Update content if changed externally (e.g., initial load)
    useEffect(() => {
        if (editor && content && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className={`border border-white/10 rounded-lg ${className}`}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
