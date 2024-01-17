/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-03-10 11:43:38
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-20 14:52:50
 */
import { useEffect, useState, useRef, useCallback } from "react";
import NomessageData from "./module/nomessagedata";
import MessageList from "./module/messagelist";
import { Input, Button, message, Typography, Dropdown, Space } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import PubSub from "pubsub-js";
import {
  ReloadOutlined,
  LoadingOutlined,
  MailOutlined,
  PauseOutlined
} from "@ant-design/icons";
import { setSessionId } from "../../store/user-slice/user-slice";
import { chatSubmit, historyList, chatSubmitStream } from "../../server/messageaapiList";
import { useSelector, useDispatch } from "react-redux";
import "./message.less";
import PromptEdit from "./components/PromptEdit";
import MarkdownIt from "markdown-it";
const { TextArea } = Input;
const Message = () => {
  const promptEditRef = useRef();
  const [messageVal, setMessageVal] = useState(""); //输入框的值
  const scrollRef = useRef(null);
  const [historyloading, sethistoryloading] = useState(false);
  const sessionId = useSelector((state) => state.userdataSlice.sessionId);

  const [putLoading, setPutLoading] = useState(false);
  const [reloadLoading, setreloadLoading] = useState(false);

  const [envMsgStatus, setEnvMsgStatus] = useState(''); //< '' | '[LOADING]' | '[START]' | '[DONE]' | '[ERROR]' >
  const [chatList, setChatList] = useState([]); //<GetAllChatVO['data']>
  const [choseMode, setChooseMode] = useState(0) //0 流 1 正常

  const dispatch = useDispatch();
  const refFlowReponseId = useRef("")
  const controllerRef = useRef(null)

  const items = [
    {
      key: 0,
      label: '流模式',
    },
    {
      key: 1,
      label: '标准模式',
    }
  ];

  useEffect(() => {

    //变化了
    let time = setTimeout(() => {
      if (sessionId === "") {
        setChatList([]);
      }
    }, 300);
    return () => {
      clearTimeout(time);
    };
  }, [sessionId]);

  useEffect(() => {
    PubSub.subscribe('loadHistoryById', (topic, res) => {
      getHistoryList(res);
    })
  }, [])

  /**
   * 重新推送上一次消息
   * @returns
   */
  const reload = async () => {
    if (reloadLoading || putLoading || historyloading) {
        message.warning('请勿重复提交~')
      return false;
    }
    setPutLoading(true);
    setreloadLoading(true);
    let val, arr
    let id = Math.random().toString(36).substr(3);
    if (choseMode === 0) {
      //流
      val = chatList[chatList.length - 1].prompt;
      arr = chatList;
      setMessageVal("");
      setTimeout(() => {
        scrollRef.current.scrollY();
      }, 100);
      const res = await chatSubmitStream({
        prompt: val,
        sessionId: sessionId,
      });
      if (res?.code === 0) {
        dispatch(setSessionId(res.data.sessionId));
        setreloadLoading(false);
        setChatList(arr.concat({ prompt: val, response: "", id: refFlowReponseId.current = Math.random().toString().slice(2) }))
        connectEvenSource(res.data.sessionId, res.data.id, false);
      }

    } else {
      //标准
      val = chatList[chatList.length - 1].prompt;
      arr = chatList;
      arr.push({ prompt: val, response: "", id });
      setChatList(arr);
      setMessageVal("");
      setTimeout(() => {
        scrollRef.current.scrollY();
      }, 100);
      setEnvMsgStatus('[LOADING]')
      chatSubmit({
        prompt: val,
        sessionId: sessionId,
      })
        .then((res) => {
          PubSub.publish('refreshChatList')
          setreloadLoading(false);
          setPutLoading(false);
          setEnvMsgStatus('[DONE]')
          if (res.code === 0) {
            arr[arr.length - 1].response = res.data.response;
            dispatch(setSessionId(res.data.sessionId));
          }
          setChatList(arr);
          setTimeout(() => {
            scrollRef.current.scrollY();
          }, 100);

        })
        .catch((res) => {
          setEnvMsgStatus('[ERROR]')
          arr[arr.length - 1].errorMsg = res.msg;
          setreloadLoading(false);
          setPutLoading(false);
        });
    }

  };

  const pause = () => {
      controllerRef.current.abort(); //打断请求
      setEnvMsgStatus('[DONE]')
      setPutLoading(false);
  }

  /**
   * 提交消息
   * @returns
   */
  const submitMessage = async () => {

    //判断传输模式
    if (choseMode === 0) {
      if (
        messageVal.trim() === "" ||
        putLoading ||
        reloadLoading ||
        historyloading
      ) {
        return false;
      }
      setPutLoading(true);
      let val = messageVal;
      let arr = chatList;
      const res = await chatSubmitStream({
        prompt: val,
        sessionId: sessionId,
      });
      if (res?.code === 0) {
        dispatch(setSessionId(res.data.sessionId));
        setPutLoading(false);
        setMessageVal("");
        setChatList(arr.concat({ prompt: val, response: "", id: refFlowReponseId.current = Math.random().toString().slice(2) }))
        setTimeout(() => {
          connectEvenSource(res.data.sessionId, res.data.id, false)
        }, 0);
      }
    } else {
      if (
        messageVal.trim() === "" ||
        putLoading ||
        reloadLoading ||
        historyloading
      ) {
        return false;
      }
      setPutLoading(true);
      let val = messageVal;
      let arr = chatList;
      let id = Math.random().toString(36).substr(3);
      arr.push({ prompt: val, response: "", id });
      setChatList(arr);
      setMessageVal("");
      setTimeout(() => {
        scrollRef.current?.scrollY();
      }, 100);
      setEnvMsgStatus('[LOADING]')
      chatSubmit({ prompt: val, sessionId: sessionId })
        .then((res) => {
          PubSub.publish('refreshChatList')
          setPutLoading(false);
          setEnvMsgStatus('[DONE]')
          if (res.code === 0) {
            arr[arr.length - 1].response = res.data.response;
            dispatch(setSessionId(res.data.sessionId));
          }
          setChatList(arr);
          setTimeout(() => {
            scrollRef.current?.scrollY();
          }, 100);
        })
        .catch((res) => {
          setEnvMsgStatus('[ERROR]')
          arr[arr.length - 1].errorMsg = res.msg;
          setPutLoading(false);
        });
    }
  };

  //链接evenSource 接收回答
  const connectEvenSource = useCallback((
    conversationId,
    id,
  ) => {

    if (!conversationId || !refFlowReponseId.current) {
      message.warning(conversationId);
      refFlowReponseId.current = ""
      return;
    }
    setEnvMsgStatus('[LOADING]');
    try {
        controllerRef.current = new AbortController();
        const { signal } = controllerRef.current;
        fetchEventSource(`${process.env.REACT_APP_baseURL}/api/stream/chat/${conversationId}?id=${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'lbToken': localStorage.getItem("token")
            },
            signal: signal,
            onopen: (response) => {
                if (response.status === 200) {
                } else {
                    setEnvMsgStatus('[ERROR]');
                    setChatList(state => {
                        const newState = [...state];
                        const last = newState[newState.length-1];
                        last.errorMsg = '服务器繁忙, 请稍后重试~'
                        last.failFlag = true
                        newState[newState.length-1] = last;
                        return newState
                    })
                }
            },
            //监听消息
            onmessage: (event) => {
                //完成 错误状态处理
                if (event.data === '[DONE]' || event.data === '[ERROR]') {
                    setPutLoading(false)
                    refFlowReponseId.current = "";
                }
                //更新回答
                setEnvMsgStatus('[START]');
                setChatList((state) => {
                    const index = state.findIndex((item) => item.id === refFlowReponseId.current);
                    const newState = [...state];
                    const last = newState[index];
                    if(!last) return event.data;
                    last.response += event.data || ''
                    last.failFlag = false
                    newState[index] = last;
                    return newState
                });
            },
            //监听关闭 一般是服务器主动关闭
            onclose: () => {
                PubSub.publish('refreshChatList')
                setEnvMsgStatus('[DONE]');
                setPutLoading(false)
            },
            //监听错误 一般是网络错误
            onerror: (err) => {
                controllerRef.current.abort(); //打断请求
                setPutLoading(false);
                refFlowReponseId.current = "";
                setEnvMsgStatus('[ERROR]');
            }
        }).then(_ => {
        }).catch((err) => {
        })
    } catch (error) {
    }
  }, []);
  //获取历史记录
  const getHistoryList = (sessionId) => {
    sethistoryloading(true);
    historyList({ sessionId }).then((res) => {
      sethistoryloading(false);
      if (res.code === 0) {
         const _historyVos = res.data.historyVos.map(item => {
              if(!item.response) {
                  item.failFlag = true
              }
              return item
          })
        setChatList(_historyVos);
        // messageList.push({prompt:val,response:res.data.response})
      }
    });
  };
  const getDemotext = (e) => {
    setMessageVal(e.text);
  };
  //切换模式
  const modeHandleClick = ({ key }) => {
    setChooseMode(key === '0' ? 0 : 1)
  };

  return (
    <>
      <div className="message-content">
        {historyloading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <LoadingOutlined />
          </div>
        ) : (chatList?.length) === 0 ? (
          <NomessageData getDemotext={getDemotext} />
        ) : (
          <MessageList ref={scrollRef} messageList={chatList} envMsgStatus={envMsgStatus} choseMode={choseMode} savePrompt={(data) => {
            promptEditRef.current && promptEditRef.current.openModal(data, 'create');
          }} />
        )}
      </div>

      <div className="input-box">
        <div style={{ position: "absolute", bottom: " -90px", width: "100%" }}>
          <div
            style={{
              marginBottom: "20px",
              height: "36px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {chatList?.length !== 0 && (
                <>
                    {
                        envMsgStatus === '[START]' ?
                            <Button onClick={() => pause()}>
                                <PauseOutlined /> 停止生成
                            </Button> :
                            <Button onClick={() => reload()}>
                                <ReloadOutlined /> 重新生成
                            </Button>
                    }
                </>


            )}
          </div>
          <div style={{ display: "flex", alignItems: 'center' }}>
            <Dropdown
              menu={{
                items,
                selectable: true,
                defaultSelectedKeys: ['3'],
                onClick: modeHandleClick
              }}
              placement="top"
              arrow={{ pointAtCenter: true }}
            >
              <Typography.Link>
                <Space style={{ width: '80px' }}>
                  {items[choseMode].label}
                  <DownOutlined />
                </Space>
              </Typography.Link>
            </Dropdown>
            <TextArea
              placeholder="输入问题"
              value={messageVal}
              onChange={(e) => {
                setMessageVal(e.target.value);
              }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  submitMessage();
                }
              }}
              autoSize={{ minRows: 1, maxRows: 5 }}
            />
            <Button
              icon={<MailOutlined />}
              style={{ color: "#999", marginLeft: '16px' }}
              onClick={() => {
                submitMessage();
              }}
              loading={putLoading}
            />
          </div>
        </div>
      </div>

      <PromptEdit
        promptEditRef={promptEditRef}
        reload={() => { getHistoryList(sessionId) }}
      />
    </>
  );
};
export default Message;
