"use client"

import { createNote, createQuestion, deleteNote, deleteQuestion, retrieveNotes, retrieveQuestions } from "@/client";
import type { Topic } from "@/generated_client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { queryFormDataType } from "@/components/query/query";
import type { UseFormReturn } from "react-hook-form";

export function useCreateNote() {
    return useMutation({
        mutationFn:
            ({
                note_text,
                topics,
                photo_asset_ids,
            }: {
                note_text: string;
                topics: Topic[];
                photo_asset_ids?: number[];
            }) => {
                return createNote({
                    text: note_text,
                    topic: topics,
                    photo_asset_ids,
                });
            },
        onSuccess: () => toast.success("Note created successfully!"),
        onError: () => toast.error("Something went wrong with note creation!")
    })
}

export function useFetchNotes(form: UseFormReturn<queryFormDataType>, topics: Topic[]) {
    return useQuery({ enabled: false, queryFn: () => retrieveNotes(form.getValues('text'), form.getValues('result_limit'), topics), queryKey: ['NOTES', form.getValues('text')] })
}

export function useCreateQuestion() {
    return useMutation({
        mutationFn: ({
            question_text,
            answer_text,
            topics,
            photo_asset_ids,
        }: {
            question_text: string;
            answer_text: string;
            topics: Topic[];
            photo_asset_ids?: number[];
        }) => {
            return createQuestion({
                text: question_text,
                answer: answer_text,
                topic: topics,
                photo_asset_ids,
            });
        },
        onSuccess: () => toast("Question created successfully!"),
        onError: () => toast("Something went wrong with question creation!")
    })
}

export function useFetchQuestions(form: UseFormReturn<queryFormDataType>, topics: Topic[]) {
    return useQuery({ enabled: false, queryFn: () => retrieveQuestions(form.getValues('text'), form.getValues('result_limit'), topics), queryKey: ['QUESTIONS', form.getValues('text')] });
}

export function useDeleteNote() {
    return useMutation({
        mutationFn: (noteId: number) => deleteNote(noteId),
        onSuccess: () => toast.success("Note deleted successfully!"),
        onError: () => toast.error("Something went wrong deleting the note!"),
    });
}

export function useDeleteQuestion() {
    return useMutation({
        mutationFn: (questionId: number) => deleteQuestion(questionId),
        onSuccess: () => toast.success("Question deleted successfully!"),
        onError: () => toast.error("Something went wrong deleting the question!"),
    });
}