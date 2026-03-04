import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Minus,
  Strikethrough,
  List,
  ListOrdered,
  TextQuote,
  Undo,
  Redo,
} from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardHeader } from '@front/cn/components/card';
import { cn } from '@front/cn/utils';
import type { ProgramDraft } from '@models/classes';

interface DescriptionsStepProps {
  programs: ProgramDraft[];
  onDescriptionChange: (programId: string, description: string) => void;
}

export function DescriptionsStep({ programs, onDescriptionChange }: DescriptionsStepProps) {
  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <ProgramDescriptionCard
          key={program.id}
          program={program}
          onDescriptionChange={onDescriptionChange}
        />
      ))}
    </div>
  );
}

interface ProgramDescriptionCardProps {
  program: ProgramDraft;
  onDescriptionChange: (programId: string, description: string) => void;
}

function ProgramDescriptionCard({ program, onDescriptionChange }: ProgramDescriptionCardProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: program.description || '',
    onUpdate: ({ editor }) => {
      onDescriptionChange(program.id, editor.getHTML());
    },
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isH1: ctx.editor.isActive('heading', { level: 1 }),
      isH2: ctx.editor.isActive('heading', { level: 2 }),
      isH3: ctx.editor.isActive('heading', { level: 3 }),
      isBold: ctx.editor.isActive('bold'),
      canBold: ctx.editor.can().chain().focus().toggleBold().run(),
      isItalic: ctx.editor.isActive('italic'),
      canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
      isStrike: ctx.editor.isActive('strike'),
      canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
      isBulletList: ctx.editor.isActive('bulletList'),
      isOrderedList: ctx.editor.isActive('orderedList'),
      isBlockquote: ctx.editor.isActive('blockquote'),
      canUndo: ctx.editor.can().chain().undo().run(),
      canRedo: ctx.editor.can().chain().redo().run(),
    }),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{program.title}</p>
            <p className="text-sm text-muted-foreground">
              {program.slotIds.length}{' '}
              {program.slotIds.length === 1 ? 'slot seleccionado' : 'slots seleccionados'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">Descripción del entrenamiento</p>

        <div className="rounded-md border">
          <div className="flex flex-wrap gap-1 border-b p-1.5">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editorState?.isH1 ?? false}
              title="Encabezado 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editorState?.isH2 ?? false}
              title="Encabezado 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editorState?.isH3 ?? false}
              title="Encabezado 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <div className="mx-1 w-px self-stretch bg-border" />

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              isActive={editorState?.isBold ?? false}
              disabled={!editorState?.canBold}
              title="Negrita"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              isActive={editorState?.isItalic ?? false}
              disabled={!editorState?.canItalic}
              title="Cursiva"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              isActive={editorState?.isStrike ?? false}
              disabled={!editorState?.canStrike}
              title="Tachado"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>

            <div className="mx-1 w-px self-stretch bg-border" />

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              isActive={editorState?.isBulletList ?? false}
              title="Lista de viñetas"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              isActive={editorState?.isOrderedList ?? false}
              title="Lista numerada"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              isActive={editorState?.isBlockquote ?? false}
              title="Cita"
            >
              <TextQuote className="h-4 w-4" />
            </ToolbarButton>

            <div className="mx-1 w-px self-stretch bg-border" />

            <ToolbarButton
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              isActive={false}
              title="Línea divisoria"
            >
              <Minus className="h-4 w-4" />
            </ToolbarButton>

            <div className="mx-1 w-px self-stretch bg-border" />

            <ToolbarButton
              onClick={() => editor?.chain().focus().undo().run()}
              isActive={false}
              title="Deshacer"
              disabled={!editorState?.canUndo}
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().redo().run()}
              isActive={false}
              title="Rehacer"
              disabled={!editorState?.canRedo}
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <EditorContent
            editor={editor}
            className="tiptap-content"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Describe el contenido, objetivos o instrucciones del entrenamiento para este programa.
        </p>
      </CardContent>
    </Card>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, title, disabled, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground')}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}
