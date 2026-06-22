import { usingPromises } from "@/utils/toPromise";

import {Configuration, MlApiFactory, AssetApiFactory} from "../generated_client";

const config = new Configuration({basePath:"http://localhost:8000"})
let accessToken = "";

export const setAccessToken = (token: string) => {
    config.accessToken = token;
    accessToken = token;
}


export const getAccessToken = () => {
    return accessToken;
}

export const setBasePath = (basePath: string) => {
    config.basePath = basePath;
}

export const hasBasePath = () => !!config.basePath;

export const getApiBasePath = () => config.basePath ?? "http://localhost:8000";

export const getPhotoAssetUrl = (assetId: number) =>
    `${getApiBasePath()}/asset/photo/${assetId}`;

const mlApi = MlApiFactory(config);
export const createNote = usingPromises(mlApi.embedSentenceMlEmbedPost);
export const retrieveNotes = usingPromises(mlApi.searchForValueMlSearchNoteGet);
export const deleteNote = usingPromises(mlApi.deleteNoteMlNoteDelete);
export const createQuestion = usingPromises(mlApi.createQuestionMlQuestionPost);
export const retrieveQuestions = usingPromises(mlApi.searchForQuestionMlSearchQuestionGet);
export const deleteQuestion = usingPromises(mlApi.deleteQuestionMlQuestionDelete);
export const editQuestion = usingPromises(mlApi.editQuestionMlQuestionPut);
export const editNote = usingPromises(mlApi.editSentenceMlEditPut);

const assetApi = AssetApiFactory(config);
export { assetApi };
export const createAsset = usingPromises(assetApi.createAssetAssetCreateAssetPost);
export const createPhotoAsset = usingPromises(assetApi.createPhotoAssetAssetCreatePhotoAssetPost);
export const createVolumeAsset = usingPromises(assetApi.createVolumeAssetAssetCreateVolumeAssetPost);
export const listAssets = usingPromises(assetApi.listAssetsAssetListAssetsGet);
export const deletePhotoAsset = usingPromises(assetApi.deletePhotoAssetAssetPhotoAssetIdDelete);
export const getPhotoAsset = usingPromises(assetApi.getPhotoAssetAssetPhotoAssetIdGet);