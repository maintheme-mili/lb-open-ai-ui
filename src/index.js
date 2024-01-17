/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-01-14 10:14:54
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-14 18:28:59
 */
import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import PageView from "./router/route-page";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ConfigProvider } from "antd";
import zh_CN from "antd/lib/locale/zh_CN";
import "./index.less";
import './global.less';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ConfigProvider locale={zh_CN}>
    <Provider store={store}>
      <PageView />
    </Provider>
  </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
