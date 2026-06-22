import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";
import { useFetchNotes, useCreateNote, useCreateQuestion, useFetchQuestions, useDeleteNote, useDeleteQuestion } from "@/hooks/notes";
import { useCreatePhotoAsset, useSearchPhotos } from "@/hooks/assets";
import { Topic, type EmbeddedSentenceGet, type QuestionGet } from "@/generated_client";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useState, useEffect, type ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../data-table/data-table";
import { toast } from "sonner";

import { AssociatedPhotos, PhotoGallery, PhotoPicker } from "@/components/media/photos";

import { IconSettings } from "../topics/topic";

export const formSchema = z.object({
    text: z.string(),
    result_limit: z.number().int(),
    answer: z.string()
})

export type queryFormDataType = z.infer<typeof formSchema>;

export const photoFormSchema = z.object({
    description: z.string(),
    format: z.string().min(1, "Format is required"),
})

export type photoFormDataType = z.infer<typeof photoFormSchema>;

const cardStyle = "rounded-md border flex max-w-screen gap-2"
const descriptionStyle = "text-lg font-bold"
const fieldGroupStyle = { 'padding': '2em' }
const contentStyle = "gap-2"

function formatFromFile(file: File): string {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    return extension === "jpg" ? "jpeg" : extension;
}

function DeleteConfirmModal({
    open,
    onClose,
    onConfirm,
    isPending,
    title,
    description,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isPending: boolean;
    title: string;
    description: ReactNode;
}) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                className="max-w-lg w-full mx-4 rounded-md border bg-background p-6 shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
                            {isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PhotoCreate({ selected }: { selected: string[] }) {
    const createPhotoAssetHook = useCreatePhotoAsset();
    const topics = selected as Topic[];
    const [fileInputKey, setFileInputKey] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchText, setSearchText] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const { data: photos, refetch: refetchPhotos } = useSearchPhotos(submittedSearch, topics);

    const form = useForm<photoFormDataType>({
        resolver: zodResolver(photoFormSchema),
        defaultValues: { description: "", format: "" },
    });

    function onSubmit(data: photoFormDataType) {
        if (!selectedFile) {
            toast.error("Choose a photo to upload.");
            return;
        }

        createPhotoAssetHook.mutate(
            {
                file: selectedFile,
                format: data.format,
                description: data.description,
                topics,
            },
            {
                onSuccess: () => {
                    form.reset();
                    setSelectedFile(null);
                    setFileInputKey((key) => key + 1);
                    refetchPhotos();
                },
            },
        );
    }

    function onSearchSubmit(event: React.FormEvent) {
        event.preventDefault();
        setSubmittedSearch(searchText.trim());
    }

    const photoAssets = photos ?? [];
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    return (
        <div className="flex flex-col gap-4">
            <Card className={cardStyle}>
                <CardHeader>
                    <CardTitle className="text-lg">Upload Photo Asset</CardTitle>
                </CardHeader>
                <CardDescription className={descriptionStyle}>
                    Add a photo to the media library. It will be tagged with the topics selected below.
                </CardDescription>
                <CardContent className={contentStyle}>
                    <form id="photocreateform" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup style={fieldGroupStyle}>
                            <Field>
                                <FieldLabel>Photo File</FieldLabel>
                                <Input
                                    key={fileInputKey}
                                    type="file"
                                    accept="image/*"
                                    aria-invalid={!selectedFile && form.formState.isSubmitted}
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null;
                                        setSelectedFile(file);
                                        if (file) {
                                            form.setValue("format", formatFromFile(file), {
                                                shouldValidate: true,
                                            });
                                        } else {
                                            form.setValue("format", "", { shouldValidate: true });
                                        }
                                    }}
                                />
                            </Field>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Selected photo preview"
                                    className="max-h-48 rounded-md border object-contain"
                                />
                            ) : null}
                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Description</FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Describe this photo"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="format"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Format</FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="jpeg, png, webp..."
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button
                        className="justify-center hover:bg-muted-foreground"
                        type="submit"
                        form="photocreateform"
                        disabled={createPhotoAssetHook.isPending}
                    >
                        {createPhotoAssetHook.isPending ? "Uploading..." : "Upload Photo"}
                    </Button>
                </CardFooter>
            </Card>

            <Card className={cardStyle}>
                <CardHeader>
                    <CardTitle className="text-lg">Photo Library</CardTitle>
                </CardHeader>
                <CardDescription className={descriptionStyle}>
                    Search photos by description. Results are filtered by the selected topics below.
                </CardDescription>
                <CardContent className={contentStyle}>
                    <form onSubmit={onSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <Field className="flex-1">
                            <FieldLabel>Search by description</FieldLabel>
                            <Input
                                value={searchText}
                                onChange={(event) => setSearchText(event.target.value)}
                                placeholder="Describe what you're looking for..."
                            />
                        </Field>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    <PhotoGallery photos={photoAssets} />
                </CardContent>
            </Card>
        </div>
    );
}

function NoteQuery({ selected }: { selected: string[] }) {

    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", result_limit: 5, answer: 'Default Answer' } });
    const { data: notes, refetch: refetchNotes } = useFetchNotes(form, selected as Topic[]);
    const deleteNoteHook = useDeleteNote();
    const [noteToDelete, setNoteToDelete] = useState<EmbeddedSentenceGet | null>(null);

    function onSubmit(data: queryFormDataType) {
        refetchNotes();
    }

    function confirmDeleteNote() {
        if (!noteToDelete) {
            return;
        }

        deleteNoteHook.mutate(noteToDelete.note_id, {
            onSuccess: () => {
                setNoteToDelete(null);
                refetchNotes();
            },
        });
    }

    const columns: ColumnDef<EmbeddedSentenceGet>[] = [
        {
            accessorKey: "text",
            header: "Note Text"
        },
        {
            id: "photos",
            header: "Photos",
            cell: ({ row }) => <AssociatedPhotos photos={row.original.photos} />,
        },
        {
            accessorKey: "topic",
            header: "Topics",
            cell: ({ row }) => {
                return row.getValue('topic').map((item, index) => {
                    // get icon dynamically, fallback to a placeholder if missing
                    const Icon = IconSettings[item].icon;

                    return (
                        <span key={item} className="flex items-center gap-1 text-md">
                            {Icon && <Icon className="w-5 h-5 inline-block" fill={IconSettings[item].fill} stroke={IconSettings[item].stroke} />}
                            {item[0].toUpperCase() + item.slice(1)}
                            {index < selected.length - 1 ? "," : ""}
                        </span>
                    );
                })
            }
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setNoteToDelete(row.original)}
                >
                    Delete
                </Button>
            ),
        },
    ]

    return <Card className={cardStyle}>
        <CardHeader>
            <CardTitle className="text-lg">Construct the Query</CardTitle>
        </CardHeader>
        <CardDescription className={descriptionStyle}>
            Describe what information you want to retrieve.
        </CardDescription>
        <CardContent className={contentStyle}>
            <form id="notequeryform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup style={fieldGroupStyle}>
                    <Controller
                        name="text"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Search Text
                                </FieldLabel>
                                <Input {...field} aria-invalid={fieldState.invalid} placeholder="Type search here" />
                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                            </Field>
                        )}
                    />
                    <Controller
                        name="result_limit"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Result Limit
                                </FieldLabel>
                                <Input {...field}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Limit result" />
                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </form>
            {((notes != undefined) && notes.length > 0) ? <DataTable columns={columns} data={notes} /> : ''}
            <DeleteConfirmModal
                open={noteToDelete !== null}
                onClose={() => setNoteToDelete(null)}
                onConfirm={confirmDeleteNote}
                isPending={deleteNoteHook.isPending}
                title="Delete note?"
                description={
                    <>
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">
                            {noteToDelete?.text || "this note"}
                        </span>
                        ? This action cannot be undone.
                    </>
                }
            />
        </CardContent>
        <CardFooter>
            <Button className="justify-center hover:bg-muted-foreground" type="submit" form="notequeryform">Submit Query</Button>
        </CardFooter>
    </Card >
}

function NoteCreate({ selected }: { selected: string[] }) {
    const createNoteHook = useCreateNote();
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);

    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", answer: '', result_limit: 5 } });

    function onSubmit(data: queryFormDataType) {
        createNoteHook.mutate({
            note_text: data["text"],
            topics: selected as Topic[],
            photo_asset_ids: selectedPhotoIds,
        });
        form.reset();
        setSelectedPhotoIds([]);
    }

    return <Card className={cardStyle}>
        <CardHeader>
            <CardTitle className="text-lg">Create the Note</CardTitle>
        </CardHeader>
        <CardDescription className={descriptionStyle}>
            Write the note that you'd like to submit. Select the topics from the buttons below.
        </CardDescription>
        <CardContent className={contentStyle}>
            <form id="notecreateform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup style={fieldGroupStyle}>
                    <Controller
                        name="text"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Note Text
                                </FieldLabel>
                                <Input {...field} aria-invalid={fieldState.invalid}
                                    placeholder="Type Note Here" />
                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                            </Field>
                        )}
                    />
                    <PhotoPicker
                        selectedPhotoIds={selectedPhotoIds}
                        onChange={setSelectedPhotoIds}
                        topics={selected as Topic[]}
                    />
                </FieldGroup>
            </form>
        </CardContent>
        <CardFooter>
            <Button className="justify-center hover:bg-muted-foreground" type="submit" form="notecreateform">Create Note</Button>
        </CardFooter>
    </Card>


}

function QuestionCreate({ selected }: { selected: string[] }) {

    const createQuestion = useCreateQuestion();
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);
    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", result_limit: 5, answer: '' } });

    function onSubmit(data: z.infer<typeof formSchema>) {
        createQuestion.mutate({
            question_text: data["text"],
            answer_text: data["answer"],
            topics: selected as Topic[],
            photo_asset_ids: selectedPhotoIds,
        });
        setSelectedPhotoIds([]);
    }

    return <Card className={cardStyle}>
        <CardHeader>
            <CardTitle className="text-lg">Create the Question</CardTitle>
        </CardHeader>
        <CardDescription className={descriptionStyle}>
            Write the question that you'd like to submit.
        </CardDescription>
        <CardContent className={contentStyle}>
            <form id="questioncreateform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup style={fieldGroupStyle}>
                    <Controller
                        name="text"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Question Text
                                </FieldLabel>
                                <Input {...field} aria-invalid={fieldState.invalid}
                                    placeholder="Type Question Here" />
                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                            </Field>
                        )}
                    />
                    <Controller
                        name="answer"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Answer Text
                                </FieldLabel>
                                <Input {...field} aria-invalid={fieldState.invalid}
                                    placeholder="Type Answer Here" />
                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                            </Field>
                        )}
                    />
                    <PhotoPicker
                        selectedPhotoIds={selectedPhotoIds}
                        onChange={setSelectedPhotoIds}
                        topics={selected as Topic[]}
                    />
                </FieldGroup>
            </form>
        </CardContent>
        <CardFooter>
            <Button className="justify-center hover:bg-muted-foreground" type="submit" form="questioncreateform">Create Question</Button>
        </CardFooter>
    </Card>
}

function QuestionQuery({ selected }: { selected: string[] }) {
    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", result_limit: 5, answer: 'Default Answer' } });

    const { data: questions, refetch: refetchQuestions } = useFetchQuestions(form, selected as Topic[]);
    const deleteQuestionHook = useDeleteQuestion();
    const [questionToDelete, setQuestionToDelete] = useState<QuestionGet | null>(null);

    function onSubmit(data: queryFormDataType) {
        refetchQuestions();
    }

    function confirmDeleteQuestion() {
        if (!questionToDelete) {
            return;
        }

        deleteQuestionHook.mutate(questionToDelete.question_id, {
            onSuccess: () => {
                setQuestionToDelete(null);
                refetchQuestions();
            },
        });
    }

    const columns: ColumnDef<QuestionGet>[] = [
        {
            accessorKey: 'text',
            header: 'Question text'
        },
        {
            accessorKey: 'answer',
            header: 'Answer text',
            cell: ({ row }) => {
                return <div className="whitespace-normal break-words">
                    {row.getValue('answer')}
                </div>
            }
        },
        {
            id: "photos",
            header: "Photos",
            cell: ({ row }) => <AssociatedPhotos photos={row.original.photos} />,
        },
        {
            accessorKey: "topic",
            header: "Topics",
            cell: ({ row }) => {
                return row.getValue('topic').map((item, index) => {
                    // get icon dynamically, fallback to a placeholder if missing
                    const Icon = IconSettings[item].icon;

                    return (
                        <span key={item} className="flex items-center gap-1 text-md">
                            {Icon && <Icon className="w-5 h-5 inline-block" fill={IconSettings[item].fill} stroke={IconSettings[item].stroke} />}
                            {item[0].toUpperCase() + item.slice(1)}
                            {index < selected.length - 1 ? "," : ""}
                        </span>
                    );
                })
            }
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setQuestionToDelete(row.original)}
                >
                    Delete
                </Button>
            ),
        },
    ]

    return <Card className={cardStyle}>
        <CardHeader>
            <CardTitle className="text-lg">Construct the Query</CardTitle>
        </CardHeader>
        <CardDescription className="text-lg font-bold">
            Describe what information you want to be questioned on.
        </CardDescription>
        <CardContent className={contentStyle}>
            <form id="questionqueryform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup style={fieldGroupStyle}>
                    <Controller
                        name="text"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Search Text
                                </FieldLabel>
                                <Input {...field} aria-invalid={fieldState.invalid} placeholder="Type search here" />
                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                            </Field>
                        )}
                    />
                    <Controller
                        name="result_limit"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Number Requested
                                </FieldLabel>
                                <Input {...field} aria-invalid={fieldState.invalid}
                                    placeholder="How many results requested?" />
                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </form>
            {((questions != undefined) && questions.length > 0) ? <DataTable columns={columns} data={questions} /> : ''}
            <DeleteConfirmModal
                open={questionToDelete !== null}
                onClose={() => setQuestionToDelete(null)}
                onConfirm={confirmDeleteQuestion}
                isPending={deleteQuestionHook.isPending}
                title="Delete question?"
                description={
                    <>
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">
                            {questionToDelete?.text || "this question"}
                        </span>
                        ? This action cannot be undone.
                    </>
                }
            />
        </CardContent>
        <CardFooter>
            <Button className="justify-center hover:bg-muted-foreground border" style={{ 'padding': '1em' }} type="submit" form="questionqueryform">Submit Query</Button>
        </CardFooter>
    </Card >
}


export interface QueryTabsProps {
    selected: string[]
}


export function QueryTabs(props: QueryTabsProps) {
    const [enabled, setEnabled] = useState<boolean>(false);
    return <div className="w-full flex-col gap-6 justify-center bg-muted/85 rounded-md border" >
        <Tabs defaultValue="notes">
            <TabsList>
                <TabsTrigger value="notes" >
                    Notes
                </TabsTrigger>
                <TabsTrigger value="questions">
                    Questions
                </TabsTrigger>
                <TabsTrigger value="media">
                    Media
                </TabsTrigger>
            </TabsList>
            <TabsContent value="notes">
                <div className="flex justify-center items-center space-x-2">
                    <Switch id='mode'
                        checked={enabled}
                        onCheckedChange={setEnabled} />
                    <Label color="white" className="text-lg" htmlFor="mode">{enabled ? "Query" : "Create"}</Label>
                </div>
                {enabled ? <NoteQuery selected={props.selected} /> : <NoteCreate selected={props.selected} />}
            </TabsContent>
            <TabsContent value="questions">
                <div className="flex justify-center items-center space-x-2">
                    <Switch id='questionmode'
                        checked={enabled}
                        onCheckedChange={setEnabled} />
                    <Label color="white" className="text-lg" htmlFor="questionmode">{enabled ? "Query" : "Create"}</Label>
                </div>
                {enabled ? <QuestionQuery selected={props.selected} /> : <QuestionCreate selected={props.selected} />}
            </TabsContent>
            <TabsContent value="media">
                <PhotoCreate selected={props.selected} />
            </TabsContent>
        </Tabs>
    </div >
}