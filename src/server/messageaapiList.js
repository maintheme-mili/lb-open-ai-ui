/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-03-13 15:31:14
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-17 09:28:54
 */
import http from "./http";

/**
 * 获取chatid
 */
function chatId() {
  return new Promise((resolve, reject) => {
    http("get", "api/chat/id").then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
function chatSubmitStream(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/stream/submit", param).then(
      (res) => {
        resolve(res)
      },
      (error) => {
        reject(error);
      }
    )
  })
}

/**
 * 发送消息
 * @param {String} prompt 需要发送的消息
 * @param {String} sessionId chatId获取的id
 */
function chatSubmit(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/chat/submit", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 右侧会话详情
 * @param {*} param
 * @returns
 */
function historyList(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/chat/history/session-info", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * 左侧会话详情
 * @param {*} param
 * @returns
 */
function pageoflist(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/chat/history/page-of-list", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * 删除聊天集合
 * @param {*} param
 * @returns
 */
function deleteMessage(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/chat/delete/" + param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 新增空白的聊天集合
 */
function createMessageItem(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/chat/create", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * 修改会话名称
 */
function saveMessageTitle(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/chat/save", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 新增文件夹
 */
function addFolderChat(type, param) {
  return new Promise((resolve, reject) => {
    http("post", "api/prompt/engineer/add/" + type, param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 修改文件夹
 */
function updateFolderChat(id, param) {
  return new Promise((resolve, reject) => {
    http("post", "api/prompt/engineer/update/" + id, param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 删除文件夹
 */
function delFolderChat(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/prompt/engineer/del/" + param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 获取文件夹列表
 */
function getFolderChatList(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/prompt/engineer/get").then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 获取文件夹排序
 */
function getFolderChatListSort(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/prompt/engineer/sort", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 移动项目会话记录
 * fromId 移出的id
 * toId 移入的id
 */
function getFolderChatMove(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/prompt/engineer/move", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
/**
 * 获取项目会话记录
 */
function folderGetChatList(id) {
  return new Promise((resolve, reject) => {
    http("post", "api/prompt/engineer/get-chat/" + id).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

const savePrompt = (params) => {
  return http('post', '/api/prompt/arrange/save', params).then(res => {
    return Promise.resolve(res)
  },
    err => {
      return Promise.reject(err);
    })
}

const getParentList = (params) => {
  return http('post', 'api/prompt/arrange/parent-list', params).then(res => {
    return Promise.resolve(res)
  },
    err => {
      return Promise.reject(err);
    })
}

const getProjectList = (params) => {
  return http('get', 'api/prompt/engineer/list', params).then(res => {
    return Promise.resolve(res)
  },
    err => {
      return Promise.reject(err);
    })
}

const createProject = (params) => {
  return http('post', '/api/prompt/engineer/add/flow', params).then(res => {
    return Promise.resolve(res)
  },
    err => {
      return Promise.reject(err);
    })
}

const getParentTreeList = (params) => {
  return http('post', 'api/prompt/arrange/prompt-tree-list', params).then(res => {
    return Promise.resolve(res)
  },
    err => {
      return Promise.reject(err);
    })
}


export {
  chatId, chatSubmit, historyList, pageoflist, deleteMessage, createMessageItem, saveMessageTitle,
  addFolderChat, updateFolderChat, delFolderChat, getFolderChatList, getFolderChatListSort, getFolderChatMove,
  folderGetChatList,
  savePrompt, getParentList,
  getProjectList, createProject, chatSubmitStream,
  getParentTreeList,
};
