"use client";

import { useState } from "react";
import type { PhotoAssetGet, Topic } from "@/generated_client";
import { getPhotoAssetUrl } from "@/client";
import { useDeletePhotoAsset, useSearchPhotos } from "@/hooks/assets";
import { cn } from "@/lib/utils";
import { IconSettings } from "@/components/topics/topic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { X } from "lucide-react";

function Modal({
    open,
    onClose,
    children,
    className = "max-w-lg w-full mx-4 rounded-md border bg-background p-6 shadow-lg",
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
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

function PhotoTopics({ topics }: { topics?: Topic[] | null }) {
    if (!topics || topics.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {topics.map((topic) => {
                const Icon = IconSettings[topic]?.icon;
                return (
                    <span key={topic} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {Icon ? (
                            <Icon
                                className="h-3 w-3"
                                fill={IconSettings[topic].fill}
                                stroke={IconSettings[topic].stroke}
                            />
                        ) : null}
                        {topic[0].toUpperCase() + topic.slice(1)}
                    </span>
                );
            })}
        </div>
    );
}

export function PhotoPicker({
    selectedPhotoIds,
    onChange,
    topics,
}: {
    selectedPhotoIds: number[];
    onChange: (photoIds: number[]) => void;
    topics: Topic[];
}) {
    const [searchText, setSearchText] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const { data: photos } = useSearchPhotos(submittedSearch, topics);
    const photoAssets = photos ?? [];

    function runSearch() {
        setSubmittedSearch(searchText.trim());
    }

    function togglePhoto(assetId: number) {
        if (selectedPhotoIds.includes(assetId)) {
            onChange(selectedPhotoIds.filter((id) => id !== assetId));
            return;
        }
        onChange([...selectedPhotoIds, assetId]);
    }

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium">Attach photos</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Field className="flex-1">
                    <FieldLabel>Search by description</FieldLabel>
                    <Input
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                runSearch();
                            }
                        }}
                        placeholder="Describe the photo you're looking for..."
                    />
                </Field>
                <Button type="button" variant="secondary" onClick={runSearch}>
                    Search
                </Button>
            </div>
            {photoAssets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {submittedSearch
                        ? "No photos match your search."
                        : "Upload photos in the Media tab or adjust the selected topics below."}
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photoAssets.map((photo) => {
                        const selected = selectedPhotoIds.includes(photo.asset_id);
                        return (
                            <button
                                key={photo.asset_id}
                                type="button"
                                onClick={() => togglePhoto(photo.asset_id)}
                                className={cn(
                                    "overflow-hidden rounded-md border text-left transition",
                                    selected ? "ring-2 ring-primary border-primary" : "hover:border-muted-foreground",
                                )}
                            >
                                <img
                                    src={getPhotoAssetUrl(photo.asset_id)}
                                    alt={photo.description || `Photo ${photo.asset_id}`}
                                    className="h-24 w-full object-cover"
                                />
                                <div className="space-y-1 p-2 text-xs">
                                    <p>{photo.description || "Untitled photo"}</p>
                                    <PhotoTopics topics={photo.topic} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
            {selectedPhotoIds.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                    {selectedPhotoIds.length} photo{selectedPhotoIds.length === 1 ? "" : "s"} selected
                </p>
            ) : null}
        </div>
    );
}

export function AssociatedPhotos({ photos }: { photos?: PhotoAssetGet[] }) {
    const [photoToView, setPhotoToView] = useState<PhotoAssetGet | null>(null);

    if (!photos || photos.length === 0) {
        return <span className="text-sm text-muted-foreground">No photos</span>;
    }

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {photos.map((photo) => (
                    <button
                        key={photo.asset_id}
                        type="button"
                        onClick={() => setPhotoToView(photo)}
                        className="overflow-hidden rounded-md border"
                    >
                        <img
                            src={getPhotoAssetUrl(photo.asset_id)}
                            alt={photo.description || `Photo ${photo.asset_id}`}
                            className="h-16 w-16 object-cover"
                        />
                    </button>
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
                        <div className="space-y-1 px-2 pb-2">
                            <p className="font-medium">
                                {photoToView.description || "Untitled photo"}
                            </p>
                            <PhotoTopics topics={photoToView.topic} />
                        </div>
                    </div>
                ) : null}
            </Modal>
        </>
    );
}

export function PhotoGallery({ photos }: { photos: PhotoAssetGet[] }) {
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
                No photos match your search.
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
                        <div className="space-y-2 p-3">
                            <p className="font-medium">
                                {photo.description || "Untitled photo"}
                            </p>
                            <PhotoTopics topics={photo.topic} />
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
                        <div className="space-y-1 px-2 pb-2">
                            <p className="font-medium">
                                {photoToView.description || "Untitled photo"}
                            </p>
                            <PhotoTopics topics={photoToView.topic} />
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
