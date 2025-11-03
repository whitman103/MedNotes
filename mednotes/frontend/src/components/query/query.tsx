import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";
import { useFetchNotes, useCreateNote, useCreateQuestion } from "@/hooks/notes";
import { Topic } from "@/generated_client";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useState } from "react";

const formSchema = z.object({
    text: z.string(),
    result_limit: z.number().int(),
    answer: z.string()
})

export type queryFormDataType = z.infer<typeof formSchema>;


function NoteQuery({ selected }: { selected: string[] }) {

    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", result_limit: 5, answer: 'Default Answer' } });
    const { data: notes, refetch: refetchNotes } = useFetchNotes(form, 5, selected as Topic[]);

    function onSubmit(data: queryFormDataType) {
        refetchNotes();
    }

    return <Card className="w-full sm:max-w-md">
        <CardHeader>
            <CardTitle>Construct the Query</CardTitle>
        </CardHeader>
        <CardDescription>
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
    }

    return <Card className="w-full sm:max-w-md">
        <CardHeader>
            <CardTitle>Create the Note</CardTitle>
        </CardHeader>
        <CardDescription>
            Write the note that you'd like to submit.
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

    return <Card className="w-full sm:max-w-md">
        <CardHeader>
            <CardTitle>Create the Question</CardTitle>
        </CardHeader>
        <CardDescription>
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


export interface QueryTabsProps {
    selected: string[]
}


export function QueryTabs(props: QueryTabsProps) {
    const [enabled, setEnabled] = useState<boolean>(false);
    return <div className="flex w-full flex-col gap-6 justify-center bg-muted/85" >
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
                <Switch id='mode'
                    checked={enabled}
                    onCheckedChange={setEnabled} />
                <Label color="white" htmlFor="mode">{enabled ? "Query" : "Create"}</Label>
                {enabled ? <NoteQuery selected={props.selected} /> : <NoteCreate selected={props.selected} />}
            </TabsContent>
            <TabsContent value="questions">
                <QuestionCreate selected={props.selected} />
            </TabsContent>
        </Tabs>
    </div >
}