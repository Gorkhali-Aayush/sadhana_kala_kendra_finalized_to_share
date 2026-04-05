'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter formatted content with rich formatting...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: false,
      }),
      Underline,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none px-4 py-3 bg-white min-h-96',
      },
    },
  });

  // Sync editor content when value prop changes
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="h-64 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-gray-500">
        Loading editor...
      </div>
    );
  }

  const toggleHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const toggleUnderline = () => {
    editor.chain().focus().toggleUnderline().run();
  };

  const toggleStrike = () => {
    editor.chain().focus().toggleStrike().run();
  };

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  const toggleCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const setLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  const buttonClass =
    'px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition text-sm font-medium disabled:opacity-50';
  const activeButtonClass =
    'px-3 py-1.5 rounded border border-indigo-500 bg-indigo-100 text-indigo-700 transition text-sm font-medium';

  return (
    <div className="border border-slate-300 rounded-md overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, () => toggleHeading(1))}
          className={editor.isActive('heading', { level: 1 }) ? activeButtonClass : buttonClass}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, () => toggleHeading(2))}
          className={editor.isActive('heading', { level: 2 }) ? activeButtonClass : buttonClass}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, () => toggleHeading(3))}
          className={editor.isActive('heading', { level: 3 }) ? activeButtonClass : buttonClass}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, toggleBold)}
          className={editor.isActive('bold') ? activeButtonClass : buttonClass}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, toggleItalic)}
          className={editor.isActive('italic') ? activeButtonClass : buttonClass}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, toggleUnderline)}
          className={editor.isActive('underline') ? activeButtonClass : buttonClass}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, toggleStrike)}
          className={editor.isActive('strike') ? activeButtonClass : buttonClass}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <div className="w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, toggleBulletList)}
          className={editor.isActive('bulletList') ? activeButtonClass : buttonClass}
          title="Bullet List"
        >
          ●
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, toggleOrderedList)}
          className={editor.isActive('orderedList') ? activeButtonClass : buttonClass}
          title="Ordered List"
        >
          1.
        </button>

        <div className="w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, toggleBlockquote)}
          className={editor.isActive('blockquote') ? activeButtonClass : buttonClass}
          title="Blockquote"
        >
          "
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, toggleCodeBlock)}
          className={editor.isActive('codeBlock') ? activeButtonClass : buttonClass}
          title="Code Block"
        >
          &lt;&gt;
        </button>

        <div className="w-px bg-slate-300 mx-1" />

        <button type="button" onMouseDown={(e) => handleButtonClick(e, setLink)} className={buttonClass} title="Insert Link">
          Link
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleButtonClick(e, clearFormatting)}
          className={buttonClass}
          title="Clear Formatting"
        >
          ✕
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
