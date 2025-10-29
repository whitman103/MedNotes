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
export const getBaseline = usingPromises(mlApi.baselineGetMlGet);