/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-03-08 16:15:51
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-13 17:59:38
 */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: {},
  questionList: [],
  editMessageid: "",
  sessionId:"",
};
/**
 * 用户登录信息
 */
export const userdataSlice = createSlice({
  name: "userdata",
  initialState,
  reducers: {
    /**
     * 设置问题列表
     */
    setQuestionList: (state, action) => {
      state.questionList.push(action.payload);
    },
    /**
     * 设置编辑id
     * @param {*} state
     * @param {*} action
     */
    setEditId: (state, action) => {
      state.editMessageid = action.payload;
    },
    /**
     * 刷新问题列表
     */
     reloadList: (state, action) => {
      state.questionList=action.payload;
    },
    setSessionId:(state, action)=>{
      state.sessionId=action.payload;
    },

  },
});

// Action creators are generated for each case reducer function
export const { setQuestionList, setEditId,reloadList,setSessionId } = userdataSlice.actions;

export default userdataSlice.reducer;
