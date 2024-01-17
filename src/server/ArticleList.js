/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-02-11 09:22:56
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-17 09:28:37
 */
import http from "./http";

/**
 * 登录接口
 * @param {string} username
 * @param {string} password
 */
function getLogin(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/user/login", param).then(
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
 * 退出登录接口
 */
function outLogin(param) {
  return new Promise((resolve, reject) => {
    http("get", "api/user/logout", param).then(
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
 *
 * @param {*} param
 * @param { Staring } newPwd
 * @param { String } oldPwd
 * @returns
 */
function modifyPwd(param) {
  return new Promise((resolve, reject) => {
    http("post", "api/user/modify-pwd", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

function ddlogin(param) {
  return new Promise((resolve, reject) => {
    http("post", "oauth/getUserInfo", param).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export { getLogin, outLogin, modifyPwd, ddlogin };
