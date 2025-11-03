import { usingPromises } from "@/utils/toPromise";

import {Configuration, MlApiFactory} from "../generated_client";

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

const mlApi = MlApiFactory(config);
export const createNote = usingPromises(mlApi.embedSentenceMlEmbedPost);
export const retrieveNotes = usingPromises(mlApi.searchForValueMlSearchNoteGet);
export const deleteNote = usingPromises(mlApi.deleteNoteMlNoteDelete);
export const createQuestion = usingPromises(mlApi.createQuestionMlQuestionPost);
export const retrieveQuestions = usingPromises(mlApi.searchForQuestionMlSearchQuestionGet);
export const deleteQuestion = usingPromises(mlApi.deleteQuestionMlQuestionDelete);