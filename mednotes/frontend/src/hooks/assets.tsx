"use client"

import { assetApi } from "@/client";
import { usingPromises } from "@/utils/toPromise";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PhotoAssetGet } from "@/generated_client";

const createPhotoAsset = usingPromises(assetApi.createPhotoAssetAssetCreatePhotoAssetPost);
const deletePhotoAsset = usingPromises(assetApi.deletePhotoAssetAssetPhotoAssetIdDelete);
const listAssets = usingPromises(assetApi.listAssetsAssetListAssetsGet);

export function useCreatePhotoAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            file,
            format,
            description,
        }: {
            file: File;
            format: string;
            description: string;
        }) => createPhotoAsset(description, file, format),
        onSuccess: () => {
            toast.success("Photo uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["ASSETS"] });
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
            queryClient.invalidateQueries({ queryKey: ["ASSETS"] });
        },
        onError: () => toast.error("Something went wrong deleting the photo!"),
    });
}

export function useFetchAssets() {
    return useQuery({
        queryKey: ["ASSETS"],
        queryFn: () => listAssets(),
    });
}
