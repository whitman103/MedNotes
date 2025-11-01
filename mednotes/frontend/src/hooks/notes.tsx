import { createNote, retrieveNotes } from "@/client";
import type { Topic } from "@/generated_client";
import { useMutation, useQuery } from "@tanstack/react-query";


export function useCreateNote() {
    return useMutation({
        mutationFn:
            ({ note_text, topics }: { note_text: string, topics: Topic[] }) => {
                return createNote({ text: note_text, topic: topics })
            },
        onSuccess: () => { console.log('Yay success'); },
        onError: () => { console.log('Oh no!') }
    })
}

export function fetchNotes() {
    return useQuery({ enabled: false, queryFn: (sentence: string, topics: Topic[]) => retrieveNotes(sentence, topics), queryKey: ['NOTES'] })
}