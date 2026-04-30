import { useCreateNote } from "@/hooks/notes";
import { Button } from "../ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import { useState } from "react";
import { Topic } from "@/generated_client";
import { FieldGroup } from "../ui/field";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { queryFormDataType } from "./query";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./query";

export function NoteCreateDrawer({ selected, onSubmit }) {
    const useSubmitCreateNote = useCreateNote();
    const [user_text, setUserText] = useState<string>("");
    const form = useForm<queryFormDataType>({ resolver: zodResolver(formSchema), defaultValues: { text: "", result_limit: 5, answer: 'Default Answer' } });
    function submitNote() {
        useSubmitCreateNote.mutate({ note_text: user_text, topics: selected as Topic[] })
    }

    return <Drawer>
        <DrawerTrigger>Create Note</DrawerTrigger>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>Create a new Note</DrawerTitle>
            </DrawerHeader>
            <form id="notecreateform" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup style={{ 'padding': '2em' }}>
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
            <DrawerFooter>
                <Button onClick={submitNote}>Submit</Button>
                <DrawerClose>
                    <Button variant="outline">Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    </Drawer >
}