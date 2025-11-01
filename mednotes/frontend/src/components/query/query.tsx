import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";
import { fetchNotes, useCreateNote } from "@/hooks/notes";


const formSchema = z.object({
    text: z.string(),
    result_limit: z.number().int()
})


function NoteQuery({ selected }: { selected: string[] }) {
    const useFetchNotes = fetchNotes();

    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { text: "", result_limit: 5 } });

    function onSubmit(data: z.infer<typeof formSchema>) {
        createNoteHook.mutate({ note_text = data['text'], topics: selected })
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
            <Button type="submit" form="notequeryform">Submit Query</Button>
        </CardFooter>
    </Card >
}


export interface QueryTabsProps {
    selected: string[]
}


export function QueryTabs(props: QueryTabsProps) {

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
                <NoteQuery selected={props.selected} />
            </TabsContent>
            <TabsContent value="questions">

            </TabsContent>
        </Tabs>
    </div >
}