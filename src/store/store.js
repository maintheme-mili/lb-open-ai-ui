/*
 * @Author: 徐浩
 * @Date: 2023-03-03 15:03:15
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-09 16:01:35
 * @Description:
 */
import { configureStore } from "@reduxjs/toolkit"; 
import userdataSlice from "./user-slice/user-slice"; 
export const store = configureStore({
  //解决无法序列化的问题
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  reducer: { 
    userdataSlice, 
  },
});

window.store = store;
