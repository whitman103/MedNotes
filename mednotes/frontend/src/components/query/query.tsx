import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";
import { useFetchNotes, useCreateNote, useCreateQuestion, useFetchQuestions } from "@/hooks/notes";
import { useCreatePhotoAsset, useDeletePhotoAsset, useFetchAssets } from "@/hooks/assets";
import { getPhotoAssetUrl } from "@/client";
import { Topic, type EmbeddedSentenceGet, type PhotoAssetGet, type QuestionGet } from "@/generated_client";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useState, useEffect, type ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../data-table/data-table";
import { toast } from "sonner";
import { X } from "lucide-react";

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

function Modal({
    open,
    onClose,
    children,
    className = "max-w-lg w-full mx-4 rounded-md border bg-background p-6 shadow-lg",
}: {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
}) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div className={className} onClick={(event) => event.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

function PhotoGallery({ photos }: { photos: PhotoAssetGet[] }) {
    const deletePhotoAssetHook = useDeletePhotoAsset();
    const [photoToView, setPhotoToView] = useState<PhotoAssetGet | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<PhotoAssetGet | null>(null);

    function confirmDelete() {
        if (!photoToDelete) {
            return;
        }

        deletePhotoAssetHook.mutate(photoToDelete, {
            onSuccess: () => {
                setPhotoToDelete(null);
                if (photoToView?.asset_id === photoToDelete.asset_id) {
                    setPhotoToView(null);
                }
            },
        });
    }

    if (photos.length === 0) {
        return (
            <p className="text-muted-foreground text-sm mt-4">
                No photos uploaded yet.
            </p>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {photos.map((photo) => (
                    <div
                        key={photo.asset_id}
                        className="group relative overflow-hidden rounded-md border bg-background"
                    >
                        <button
                            type="button"
                            aria-label={`Delete ${photo.description || "photo"}`}
                            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                            onClick={(event) => {
                                event.stopPropagation();
                                setPhotoToDelete(photo);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="block w-full cursor-pointer"
                            onClick={() => setPhotoToView(photo)}
                        >
                            <img
                                src={getPhotoAssetUrl(photo.asset_id)}
                                alt={photo.description || `Photo ${photo.asset_id}`}
                                className="h-48 w-full object-cover transition-transform group-hover:scale-[1.02]"
                                loading="lazy"
                            />
                        </button>
                        <div className="p-3 space-y-1">
                            <p className="font-medium">
                                {photo.description || "Untitled photo"}
                            </p>
                            <p className="text-sm text-muted-foreground uppercase">
                                {photo.format}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                open={photoToView !== null}
                onClose={() => setPhotoToView(null)}
                className="max-w-[95vw] max-h-[95vh] w-auto rounded-md border bg-background p-2 shadow-lg"
            >
                {photoToView ? (
                    <div className="flex max-h-[90vh] flex-col gap-3">
                        <img
                            src={getPhotoAssetUrl(photoToView.asset_id)}
                            alt={photoToView.description || `Photo ${photoToView.asset_id}`}
                            className="max-h-[80vh] max-w-[90vw] object-contain"
                        />
                        <div className="px-2 pb-2">
                            <p className="font-medium">
                                {photoToView.description || "Untitled photo"}
                            </p>
                            <p className="text-sm text-muted-foreground uppercase">
                                {photoToView.format}
                            </p>
                        </div>
                    </div>
                ) : null}
            </Modal>

            <Modal open={photoToDelete !== null} onClose={() => setPhotoToDelete(null)}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Delete photo?</h3>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-foreground">
                                {photoToDelete?.description || "this photo"}
                            </span>
                            ? This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPhotoToDelete(null)}
                            disabled={deletePhotoAssetHook.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deletePhotoAssetHook.isPending}
                        >
                            {deletePhotoAssetHook.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

function PhotoCreate() {
    const createPhotoAssetHook = useCreatePhotoAsset();
    const { data: assets, refetch: refetchAssets } = useFetchAssets();
    const [fileInputKey, setFileInputKey] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            },
            {
                onSuccess: () => {
                    form.reset();
                    setSelectedFile(null);
                    setFileInputKey((key) => key + 1);
                    refetchAssets();
                },
            },
        );
    }

    const photoAssets = (assets ?? []).filter(
        (asset): asset is PhotoAssetGet => asset.type === "PhotoAsset",
    );
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
                    Add a photo to the media library. It will be compressed and stored on the server.
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
                    Browse uploaded photo assets.
                </CardDescription>
                <CardContent className={contentStyle}>
                    <PhotoGallery photos={photoAssets} />
                </CardContent>
            </Card>
        </div>
    );
}

function NoteQuery({ selected }: { selected: string[] }) {

    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", result_limit: 5, answer: 'Default Answer' } });
    const { data: notes, refetch: refetchNotes } = useFetchNotes(form, selected as Topic[]);

    function onSubmit(data: queryFormDataType) {
        refetchNotes();
    }

    const columns: ColumnDef<EmbeddedSentenceGet>[] = [
        {
            accessorKey: "text",
            header: "Note Text"
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
        }
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
        </CardContent>
        <CardFooter>
            <Button className="justify-center hover:bg-muted-foreground" type="submit" form="notequeryform">Submit Query</Button>
        </CardFooter>
    </Card >
}

function NoteCreate({ selected }: { selected: string[] }) {
    const createNoteHook = useCreateNote();

    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", answer: '', result_limit: 5 } });

    function onSubmit(data: queryFormDataType) {
        createNoteHook.mutate({ note_text: data['text'], topics: selected as Topic[] });
        form.reset();
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
    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", result_limit: 5, answer: '' } });

    function onSubmit(data: z.infer<typeof formSchema>) {
        createQuestion.mutate({ question_text: data['text'], answer_text: data['answer'], topics: selected as Topic[] });
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

    function onSubmit(data: queryFormDataType) {
        refetchQuestions();
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
        }
    ]

    return <Card className={cardStyle}>
        <CardHeader>
            <CardTitle className="text-lg">Construct the Query</CardTitle>
        </CardHeader>
        <CardDescription className="text-lg font-bold">
            Describe what information you want to be questioned on.
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
        </CardContent>
        <CardFooter>
            <Button className="justify-center hover:bg-muted-foreground border" style={{ 'padding': '1em' }} type="submit" form="notequeryform">Submit Query</Button>
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
                <PhotoCreate />
            </TabsContent>
        </Tabs>
    </div >
}