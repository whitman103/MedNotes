import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";
import { useFetchNotes, useCreateNote, useCreateQuestion, useFetchQuestions } from "@/hooks/notes";
import { Topic, type EmbeddedSentenceGet, type QuestionGet } from "@/generated_client";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useState } from "react";

const formSchema = z.object({
    text: z.string(),
    result_limit: z.number().int(),
    answer: z.string()
})

export type queryFormDataType = z.infer<typeof formSchema>;

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../data-table/data-table";

import { IconSettings } from "../topics/topic";

const cardStyle = "rounded-md border flex max-w-screen gap-2"
const descriptionStyle = "text-lg font-bold"

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
        <CardContent>
            <form id="notequeryform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
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
        <CardContent>
            <form id="notecreateform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="text"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Question Text
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
        <CardContent>
            <form id="questioncreateform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
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
        <CardContent className="gap-2">
            <form id="notequeryform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup style={{ 'padding': '2em' }}>
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
        </Tabs>
    </div >
}