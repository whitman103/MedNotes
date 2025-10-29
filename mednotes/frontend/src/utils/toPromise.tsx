import type { AxiosPromise } from "axios";


function toPromise<T>(axiosPromise: AxiosPromise<T>) {
    return axiosPromise.then((res) => { return res.data })
        .catch((err) => {
            if (err.response && err.response.data) {
                if (err.response.data.display) {
                    throw new Error(err.response.data.display);
                } else if (err.response.data.detail) {
                    throw new Error(err.response.data.detail);
                }
                else {
                    throw new Error(err.response.data);
                }
            }
            else {
                throw err;
            }
        })
}



function usingPromises<A extends any[], T>(
    fn: (...args: A) => AxiosPromise<T>) {
    return (...args: A) => toPromise(fn(...args));
}

export { usingPromises, toPromise }