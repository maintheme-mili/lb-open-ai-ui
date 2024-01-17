import http, { download, success_code_http } from "./http";
// import { success_code_http } from "./http";
// import { successcode_http, post } from "./http";

// /**
//  * 获取Flow项目的列表
//  * @param {{page?: number, size?: number}} data
//  * @returns
//  */
// export const flowList = (data) =>
//   success_code_http("get", "/api/prompt/engineer/flow-list", data);

// /**
//  * 添加prompt
//  * @param {{title: string}} promptEngineerDto
//  * @param {string} type
//  * @returns
//  */
// export const addPrompt = (data, type) =>
//   success_code_http("post", `/api/prompt/engineer/add/${type}`, data);

// /**
//  * 删除prompt
//  * @param {number} id
//  * @returns
//  */
// export const delPrompt = (id) =>
//   success_code_http("post", `/api/prompt/engineer/del/${id}`);

// /**
//  * 获取prompt详情
//  * @param {number} engineerId
//  * @returns
//  */
// export const promptDetail = (engineerId) =>
//   success_code_http("get", "/api/prompt/engineer/details", { engineerId });

// /**
//  * 获取可绑定的父节点列表
//  * @param {{engineerid: string, arrangeId: string}} data
//  * @returns
//  */
// export const relationParents = (engineerId) =>
//   success_code_http("get", "/api/prompt/arrange/parent-list", {
//     engineerId,
//     arrangeId: 1,
//   });

// /**
//  * 保存prompt编排记录
//  * @param {{engineerId: string, parentId: string, promptContent: string, promptName: string, id?: string}} data
//  * @returns
//  */
// export const savePrompt = (data) =>
//   success_code_http("post", "/api/prompt/arrange/save", data);

// /**
//  * prompt编排启-停用接口
//  * @param {{engineerId: string, id: string}} data
//  * @returns
//  */
// export const promptEnable = (data) =>
//   success_code_http("post", "/api/prompt/arrange/enable", data);

// /**
//  * prompt编排预览
//  * @param {{arrangeAll?: boolean, engineerId: string, id: string}} data
//  * @returns
//  */
// export const promptPreview = (data) =>
//   success_code_http("post", "/api/prompt/arrange/preview", {
//     ...data,
//     arrangeAll: false,
//   });

// /**
//  * prompt编排启-停用接口
//  * @param {{engineerid: string, id: string}} data
//  * @returns
//  */
// export const arrangeEnable = (data) =>
//   success_code_http("post", "/api/prompt/arrange/enable", data);

// /**
//  * prompt编排历史记录
//  * @param {{engineerid: string, id: string}} data
//  * @returns
//  */
// export const historyList = (data) =>
//   success_code_http("post", "/api/prompt/arrange/history-list", data);

// /**
//  *修改prompt项目记录
//  * @param {{title: string}} data
//  * @param {string} id
//  * @returns
//  */
// export const flowUpdate = (data) =>
//   success_code_http("post", `/api/prompt/engineer/update/${data.id}`, data);

// /**
//  * 导入prompt
//  * @param {{engineerName: string, id: string, engineerId: string}} data
//  * @returns
//  */
// export const importFlow = (data) =>
//   success_code_http("post", "/api/prompt/engineer/import-flow", data);


/**
 * 获取项目列表
 * @param {{parentId?: any, type?: any}} data
 * @returns
 */
export const getProjectsList = (data) =>
    success_code_http("get", "/api/prompt/engineer/nested-list", data);

/**
 * 项目id 获取table列表
 * @param {*} params
 * @returns
 */
export const getProjectsTableList = (params) =>
    success_code_http("post", "/api/prompt/arrange/prompt-list", params);


/**
 * prompt 启\停
 * @param {*} params
 * @returns
 */
export const changeEnable = (params) =>
    success_code_http("post", "/api/prompt/arrange/enable", params);


/**
 * prompt 编辑
 * @param {*} params
 * @returns
 */
export const promptSave = (params) =>
    success_code_http("post", "/api/prompt/arrange/save", params);

/**
 * prompt 拖动排序
 * @param {*} params
 * @returns
 */
export const promptDragSort = (params) =>
    success_code_http("post", "/api/prompt/arrange/drag-sort", params);

/**
 * 导出
 * @param {FormData} data
 * @returns
 */
export const excelExport = (data) =>
    download("/api/prompt/arrange/export", data);
// /**
//  * 导出
//  * @param {{taskList: Array}} data
//  * @returns
//  */
// export const excelEport = (data) =>
//   success_code_http("post", "/api/prompt/arrange/export", data);
//   post("/api/prompt/arrange/export", data, { "Content-Type": "application/x-www-form-urlencoded", }, '', 'arraybuffer');

export const deleteProject = (id) => {
    return success_code_http('post', `/api/prompt/engineer/del/${id}`)
}

export const updateProject = (id, params) => {
    return success_code_http('post', `api/prompt/engineer/update/${id}`, params)
}