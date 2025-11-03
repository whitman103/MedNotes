import { createNote, createQuestion, retrieveNotes, retrieveQuestions } from "@/client";
import type { Topic } from "@/generated_client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { queryFormDataType } from "@/components/query/query";
import type { UseFormReturn } from "react-hook-form";
export function useCreateNote() {
    return useMutation({
        mutationFn:
            ({ note_text, topics }: { note_text: string, topics: Topic[] }) => {
                return createNote({ text: note_text, topic: topics })
            },
        onSuccess: () => { toast("Note created successfully!") },
        onError: () => { toast("Something went wrong with note creation!") }
    })
}

export function useFetchNotes(form: UseFormReturn<queryFormDataType>, result_request: number, topics: Topic[]) {
    return useQuery({ enabled: false, queryFn: () => retrieveNotes(form.getValues('text'), result_request, topics), queryKey: ['NOTES', form.watch()] })
}

export function useCreateQuestion() {
    return useMutation({
        mutationFn: ({ question_text, answer_text, topics }: { question_text: string, answer_text: string, topics: Topic[] }) => {
            return createQuestion({ text: question_text, answer: answer_text, topic: topics })
        },
        onSuccess: () => toast("Question created successfully!"),
        onError: () => { toast("Something went wrong with question creation!") }
    })
}

export function useFetchQuestions() {
    return useQuery({ enabled: false, queryFn: (question: string, topics: Topic[], result_limit: number | undefined) => retrieveQuestions(question, result_limit, topics), queryKey: ['QUESTIONS'] });
}