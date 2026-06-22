"use client"

import { createPhotoAsset, searchPhotos } from "@/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PhotoAssetGet, Topic } from "@/generated_client";
import { assetApi } from "@/client";
import { usingPromises } from "@/utils/toPromise";

const deletePhotoAsset = usingPromises(assetApi.deletePhotoAssetAssetPhotoAssetIdDelete);

export function useCreatePhotoAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            file,
            format,
            description,
            topics,
        }: {
            file: File;
            format: string;
            description: string;
            topics: Topic[];
        }) => createPhotoAsset(description, file, format, JSON.stringify(topics)),
        onSuccess: () => {
            toast.success("Photo uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["PHOTOS"] });
        },
        onError: () => toast.error("Something went wrong with photo upload!"),
    });
}

export function useDeletePhotoAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (photo: PhotoAssetGet) => deletePhotoAsset(photo.asset_id),
        onSuccess: () => {
            toast.success("Photo deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["PHOTOS"] });
        },
        onError: () => toast.error("Something went wrong deleting the photo!"),
    });
}

export function useSearchPhotos(description: string, topics: Topic[], enabled = true) {
    return useQuery({
        queryKey: ["PHOTOS", description, topics],
        enabled,
        queryFn: () => searchPhotos(description, topics.length > 0 ? topics : undefined),
    });
}
