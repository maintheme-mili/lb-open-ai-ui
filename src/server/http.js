/**
 * 网络请求配置
 */
import axios from "axios";
import qs from "qs";
import {message} from "antd";

//请求超时时间
axios.defaults.timeout = 300000;

axios.defaults.baseURL = process.env.REACT_APP_baseURL;

// promise回调策略：0: 后端状态码走resolve, Error走reject处理异常、1: 后端状态码0走resolve, 其他状态走reject并处理异常
export const CATCH_STRATEGY = 0;
export const SUCCESS_CODE_STRATEGY = 1;
let promiseStrategy = CATCH_STRATEGY;

/**
 * http request 拦截器
 */
axios.interceptors.request.use(
    (config) => {
        const contentType = config["Content-Type"];
        config.headers = {
            "Content-Type": contentType,
            lbToken: localStorage.getItem("token"),
        };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * http response 拦截器
 */
axios.interceptors.response.use(
    (response) => {
        if (response.headers['content-type'] === 'multipart/form-data; charset=UTF-8') {
            return Promise.resolve(response)
        }
        let code = response.data.code;
        let successCode = [0];
        if (!successCode.includes(code)) msag(response.data);
        if (promiseStrategy === SUCCESS_CODE_STRATEGY) {
            return Promise.resolve(response.data);
        } else {
            if (!successCode.includes(code)) return Promise.reject(response.data);
            else return Promise.resolve(response.data);
        }
    },
    (error) => {
        error.response && msag(error.response);
        if (!error.config || !error.config.retry)
            message.error(`请求超时：${error.config.url}`);

        return Promise.reject(error);
    }
);

/**
 * 封装get方法
 * @param url  请求url
 * @param params  请求参数
 * @returns {Promise}
 */
export const get = (url, params, headers, promisePolicy = CATCH_STRATEGY) => {
    promiseStrategy = promisePolicy;
    return axios.get(
        `${url}${params ? "?" : ""}${qs.stringify(params)}`,
        headers
    );
};

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export const post = (
    url,
    data,
    headers = {
        "Content-Type": "application/json",
    },
    promisePolicy = CATCH_STRATEGY
) => {
    promiseStrategy = promisePolicy;
    return axios.post(url, data, headers);
};

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export const patch = (url, data = {}, promisePolicy = CATCH_STRATEGY) => {
    promiseStrategy = promisePolicy;
    return axios.patch(url, data);
};

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export const put = (url, data = {}, promisePolicy = CATCH_STRATEGY) => {
    promiseStrategy = promisePolicy;
    return axios.put(url, data);
};

export const download = (url, params) => {
    return axios.request({
        url,
        data: params,
        method: 'post',
        responseType: 'blob',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded'
        }
    })
}


//统一接口处理，返回数据
export default function http(
    fetch,
    url,
    param,
    headers,
    promisePolicy = CATCH_STRATEGY
) {
    promiseStrategy = promisePolicy;
    fetch = fetch.toLowerCase();
    switch (fetch) {
        case "get":
            return axios.get(
                `${url}${param ? "?" : ""}${qs.stringify(param)}`,
                headers
            );
        case "post":
            return axios.post(
                url,
                param,
                headers || {"Content-Type": "application/json"}
            );
        default:
            break;
    }
}

export const success_code_http = (fecth, url, param, headers) =>
    http(fecth, url, param, headers, SUCCESS_CODE_STRATEGY);

/**
 * 失败提示
 * @param {ResponseError | {code: number, msg: string, data: any}} err
 * @returns
 */
export const msag = (err) => {
    const code = err.code || err.status;
    switch (code) {
        case 400:
            message.error("请求错误");
            break;
        case 401:
            message.error("登录过期");
            localStorage.clear();
            window.location.href = "/login";
            break;

        case 403:
            message.error("拒绝访问");
            break;

        case 404:
            const url = err.config?.url || err.url;
            message.error(`请求地址找不到${url ? ":" + url : ""}`);
            break;

        case 405:
            message.error(`方法不被访问`);
            break;

        case 408:
            message.error("请求超时");
            break;

        case 500:
            message.error("服务器内部错误");
            break;

        case 501:
            message.error("服务未实现");
            break;

        case 502:
            message.error("网关错误");
            break;

        case 503:
            message.error("服务不可用");
            break;

        case 504:
            message.error("网关超时");
            break;

        case 505:
            message.error("HTTP版本不受支持");
            break;
        default:
            err.msg && message.error(err.msg);
            break;
    }
};
