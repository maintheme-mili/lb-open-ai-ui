/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-02-11 09:22:56
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-17 14:26:21
 */
import {useEffect, useState, useRef} from "react";
import "./App.less";
import {Outlet} from "react-router-dom";
import {useNavigate, useLocation} from "react-router-dom";
import {Button, message, Popconfirm, Modal, Input} from "antd";
import {setEditId, setSessionId} from "@/store/user-slice/user-slice";
import {useSelector, useDispatch} from "react-redux";
import {outLogin, modifyPwd, ddlogin} from "@/server/ArticleList";
import Sortable from "sortablejs";
import PubSub from "pubsub-js";
import {
    deleteMessage,
    createMessageItem,
    saveMessageTitle,
    addFolderChat,
    updateFolderChat,
    delFolderChat,
    getFolderChatList,
    getFolderChatListSort,
    getFolderChatMove,
    folderGetChatList,
} from "@/server/messageaapiList";
import {
    PlusOutlined,
    LogoutOutlined,
    EditOutlined,
    DeleteOutlined,
    CommentOutlined,
    MenuFoldOutlined,
    CloseCircleOutlined,
    RightOutlined,
    CheckOutlined,
    CloseOutlined,
    AppstoreAddOutlined,
    BranchesOutlined
} from "@ant-design/icons";

let folderDragEnterItem = {};
let folderDragEnterIndex = "";
let hasCreateFolder = false;

function App(props) {
    const inputref = useRef(null);
    const folderInputRef = useRef(null);
    const folderItems = useRef(null);
    const questionItems = useRef(null);
    const menuref = useRef(null);
    const location = useLocation(); //路由
    const navigate = useNavigate(); //跳转
    const dispatch = useDispatch();
    const [defaultPassword, setdefaultPassword] = useState("");
    const [pageLoading, setPageloading] = useState(false);
    const [newPwd, setNewPwd] = useState("");
    const [oldPwd, setOldPwd] = useState("");
    const [messageApi, contextHolder] = message.useMessage(); //tip
    const [datalist, setDataList] = useState([]);
    const [realName, setRealName] = useState("");
    const [userName, setUserName] = useState("");
    const sessionId = useSelector((state) => state.userdataSlice.sessionId);
    const editId = useSelector((state) => state.userdataSlice.editMessageid);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    // 文件夹列表
    const [folderList, setFolderList] = useState([]);
    // 设置选中的下标
    const [folderIndex, setFolderIndex] = useState("");
    // 文件夹下项目列表
    const [folderChatList, setFolderChatList] = useState([]);
    const [createFolderLoad, setCreateFolderLoad] = useState(false);
    const [updateFolderChatLoad, setUpdateFolderChatLoad] = useState(false);

    useEffect(() => {
    }, [sessionId]);
    useEffect(() => {
        PubSub.subscribe('refreshChatList', () => {
            getFolderChatLists()
        })
    }, [])

    /**
     * 路由变化监听
     */
    useEffect(() => {
        let time = setTimeout(() => {
            //钉钉登录
            const searchParams = new URLSearchParams(window.location.search);
            const code = searchParams.get("code");
            const state = searchParams.get("state");
            if (code && !localStorage.getItem("userInfo")) {
                ddlogin({
                    code: code,
                    state: state,
                }).then((res) => {
                    if (res.code === 0) {
                        localStorage.setItem("token", res.data.token);
                        localStorage.setItem("userInfo", JSON.stringify(res.data));
                        getFolderChatLists();
                    }
                    if (!localStorage.getItem("token")) {
                        localStorage.clear();
                        messageApi.error("登录失败");
                        navigate({
                            pathname: "/login",
                            state: {pathname: location.pathname},
                        });
                    }
                    setRealName(
                        JSON.parse(localStorage.getItem("userInfo"))?.realName || "未登录"
                    );
                    setUserName(JSON.parse(localStorage.getItem("userInfo"))?.userName);
                });
            } else {
                if (!localStorage.getItem("token")) {
                    localStorage.clear();
                    messageApi.error("登录失败");
                    navigate({
                        pathname: "/login",
                        state: {pathname: location.pathname},
                    });
                }
            }
        }, 300);
        return () => {
            clearTimeout(time);
        };
    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        let time = setTimeout(() => {
            if (JSON.parse(localStorage.getItem("userInfo"))) {
                setRealName(
                    JSON.parse(localStorage.getItem("userInfo"))?.realName || "未登录"
                );
                setUserName(JSON.parse(localStorage.getItem("userInfo"))?.userName);
                getFolderChatLists();
            }
        }, 300);
        return () => {
            clearTimeout(time);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * 退出登录
     */
    const isOutLogin = () => {
        outLogin().then((res) => {
            if (res.code === 0) {
                localStorage.clear();
                navigate({
                    pathname: "/login",
                    state: {pathname: location.pathname},
                });
            } else {
                messageApi.open({
                    type: "error",
                    content: res.msg,
                });
            }
        });
    };
    /**
     * 删除标题
     * @param {*} item
     */
    const rmMessage = (item, index, type, fitem) => {
        deleteMessage(item.sessionId).then((res) => {
            if (res.code === 0) {
                if (type === "folderChildren") {
                    let arr = folderChatList;
                    arr.splice(index, 1);
                    setFolderChatList(JSON.parse(JSON.stringify(arr)));
                    document.getElementsByClassName('folder-box-item-titlenum' + fitem.id)[0].innerHTML = arr.length
                } else {
                    let arr = datalist;
                    arr.splice(index, 1);
                    setDataList(JSON.parse(JSON.stringify(arr)));
                }
                dispatch(setSessionId(""));
            }
        });
    };
    const createMessage = () => {
        if (datalist.length > 0) {
            if (datalist.filter((item) => !item.sessionName.trim()).length > 0) {
                messageApi.destroy();
                messageApi.error("有会话名称为空，请先输入会话名称");
                return false;
            }
        }
        createMessageItem().then((res) => {
            if (res.code === 0) {
                datalist.unshift(res.data);
                setDataList(JSON.parse(JSON.stringify(datalist)));
                dispatch(setSessionId(res.data.sessionId));
                setFolderIndex("");
                // dispatch(setQuestionList(data));
            }
        });
    };
    /**
     * 设置激活的标题
     * @param {*} item
     */
    const editMessage = (item, type, fitem) => {
        if (datalist.length > 0) {
            if (datalist.filter((item) => !item.sessionName.trim()).length > 0) {
                messageApi.destroy();
                messageApi.error("有会话名称为空，请先输入会话名称");
                return false;
            }
        }
        if (type === "folderChildren") {
            document.getElementsByClassName("folder-items-lis" + fitem.id)[0]
                .classList.remove("folder-items-lis")
        }
        dispatch(setEditId(item.sessionId));
        setTimeout(() => {
            inputref.current.focus();
            inputref.current.select();
        }, 100);
    };
    /**
     * 设置消息标题
     * @param {*} e
     * @param {*} item
     */
    const editMessageTitle = (e, item, type) => {
        item.sessionName = e.target.value;
        if (type === "folderChildren") {
            setFolderChatList(JSON.parse(JSON.stringify(folderChatList)));
        } else {
            setDataList(JSON.parse(JSON.stringify(datalist)));
        }

    };
    /**
     * 切换消息集合
     * @param {*} item
     */
    const getMessageItem = (item, e) => {
        e && e.stopPropagation();
        dispatch(setSessionId(item.sessionId));
        PubSub.publish('loadHistoryById', item.sessionId)
        if (!e) {
            setFolderIndex("");
        }
    };
    const setMessageTitle = (item, type, fitem) => {
        setTimeout(() => {
            if (!item.sessionName.trim() && !hasCreateFolder) {
                messageApi.destroy();
                messageApi.error("会话名称不能为空");
                return false;
            }
            if (!hasCreateFolder) {
                if (type === "folderChildren") {
                    document.getElementsByClassName("folder-items-lis" + fitem.id)[0]
                        .classList.add("folder-items-lis")
                }
                dispatch(setEditId(""));
                saveMessageTitle(item).then((res) => {
                    if (res.code === 0) {
                        if (type === "folderChildren") {
                            setFolderChatList(folderChatList);
                        } else {
                            setDataList(datalist);
                        }
                    }
                });
            }
        }, 100);
    };
    /**
     * 修改用户密码
     */
        // const modify=()=>{
        //   // modifyPwd
        // }
    const handleOk = () => {
            if (newPwd.trim() === "" || oldPwd.trim() === "") {
                messageApi.error(`请输入${oldPwd.trim() === "" ? "旧" : "新"}密码`);
            } else {
                setConfirmLoading(true);
                modifyPwd({newPwd, oldPwd}).then((res) => {
                    setConfirmLoading(false);
                    if (res.code === 0) {
                        setOpen(false);
                        messageApi.success("密码修改成功");
                    } else {
                        messageApi.error(res.msg);
                    }
                });
            }
        };

    const handleCancel = () => {
        setOpen(false);
    };

    // 获取chat文件夹列表
    const getFolderChatLists = () => {
        setPageloading(true);
        getFolderChatList().then((res) => {
            if (res.code === 0) {
                res.data.promptEngineerVoList = !res.data.promptEngineerVoList
                    ? []
                    : res.data.promptEngineerVoList;
                res.data.userChatVoList = !res.data.userChatVoList
                    ? []
                    : res.data.userChatVoList;
                setFolderList(res.data.promptEngineerVoList);
                let arr = [];
                let obj = {};
                res.data.userChatVoList.forEach((cur) => {
                    if (!obj[cur.sessionId]) {
                        obj[cur.sessionId] = cur;
                        arr.push(cur);
                    }
                }, []);
                // 这里得出去重后的数据
                setDataList(JSON.parse(JSON.stringify(arr)));
                setPageloading(false);
                setTimeout(() => {
                    sortableList();
                }, 100);
            } else {
                setPageloading(false);
                messageApi.error(res.msg);
            }
        });
    };
    // 新建虚拟文件夹
    const createFolder = () => {
        hasCreateFolder = true;
        setTimeout(() => {
            hasCreateFolder = false;
        }, 300);
        if (folderList.length > 0) {
            if (folderList.filter((item) => item.hasInput && !item.title.trim()).length > 0) {
                messageApi.destroy();
                messageApi.error("有文件夹名称为空，请先输入文件夹名称");
                return false;
            }
        }
        if (datalist.length > 0) {
            if (datalist.filter((item) => !item.sessionName.trim()).length > 0) {
                messageApi.destroy();
                messageApi.error("有会话名称为空，请先输入会话名称");
                return false;
            }
        }
        if (createFolderLoad) {
            return false;
        }
        setCreateFolderLoad(true)
        setFolderChatList([])
        folderNameChanged()
        addFolderChat("chat", {
            title: "新文件夹",
        }).then((res) => {
            if (res.code === 0) {
                let folderObj = res.data;
                folderObj.hasInput = true;
                folderList.unshift(folderObj);
                setFolderList(JSON.parse(JSON.stringify(folderList)));
                setFolderIndex(0);
                setTimeout(() => {
                    if (!hasCreateFolder) {
                        dispatch(setSessionId(""));
                    }
                }, 300);
                setTimeout(() => {
                    document.getElementsByClassName("folder-box-item-input0")[0].focus();
                    document.getElementsByClassName("folder-box-item-input0")[0].select();
                }, 100);
            } else {
                messageApi.error(res.msg);
            }
            setCreateFolderLoad(false)
        });
    };
    // 创建、修改文件夹
    const addFolder = (item, index, e) => {
        e && e.stopPropagation();
        if (!item.title.trim()) {
            messageApi.destroy();
            messageApi.error("文件夹名称不能为空");
            return false;
        }
        if (updateFolderChatLoad) {
            return false;
        }
        setUpdateFolderChatLoad(true)
        updateFolderChat(item.id, {
            title: item.title,
        }).then((res) => {
            if (res.code === 0) {
                item.hasInput = false;
                setFolderList(JSON.parse(JSON.stringify(folderList)))
                // getFolderChatLists()
            } else {
                messageApi.error(res.msg);
            }
            setUpdateFolderChatLoad(false)
        });
    };
    // 文件夹状态改变
    const folderNameChanged = () => {
        if (folderList.length > 0) {
            for (let i = 0; i < folderList.length; i++) {
                if (folderList[i].hasInput) {
                    updateFolderChat(folderList[i].id, {
                        title: folderList[i].title,
                    }).then((res) => {
                        if (res.code === 0) {
                        } else {
                            messageApi.error(res.msg);
                        }
                    });
                    folderList[i].hasInput = false
                }
            }
        }
    }
    // 监听文件夹标题修改
    const editFolderTitle = (e, item) => {
        e && e.stopPropagation();
        item.title = e.target.value;
        setFolderList(JSON.parse(JSON.stringify(folderList)));
    };
    // 设置激活的文件夹
    const editFolder = (item, index, e) => {
        e && e.stopPropagation();
        if (folderList.length > 0) {
            if (folderList.filter((item) => item.hasInput && !item.title.trim()).length > 0) {
                messageApi.destroy();
                messageApi.error("有文件夹名称为空，请先输入文件夹名称");
                return false;
            }
        }
        folderNameChanged()
        item.hasInput = true;
        setFolderIndex(index);
        setFolderList(JSON.parse(JSON.stringify(folderList)))
        setTimeout(() => {
            folderInputRef.current.focus();
            folderInputRef.current.select();
        }, 100);
    };
    // 删除文件夹
    const rmFolder = (item, index) => {
        if (item.id) {
            delFolderChat(item.id).then((res) => {
                if (res.code === 0) {
                    let arr = folderList;
                    arr.splice(index, 1);
                    setFolderList(JSON.parse(JSON.stringify(arr)));
                    getFolderChatLists();
                } else {
                    messageApi.error(res.msg);
                }
            });
        } else {
            let arr = folderList;
            arr.splice(index, 1);
            setFolderList(JSON.parse(JSON.stringify(arr)));
        }
        dispatch(setSessionId(""));
    };
    // 关闭文件夹激活
    const edtiorFolderClose = (item, index, e) => {
        e && e.stopPropagation();
        if (!item.title.trim()) {
            messageApi.destroy();
            messageApi.error("文件夹名称不能为空");
            return false;
        }
        item.hasInput = false;
        setFolderList(JSON.parse(JSON.stringify(folderList)))
    }
    // 前往prompt
    const goClickPrompt = () => {
        navigate({
            pathname: "/prompts",
        });
    };
    // 前往prompt
    const goClickClickFlow = () => {
        navigate({
            pathname: "/click-flow",
        });
    };
    // 切换选中
    const folderLiClick = (item, index) => {
        if (document.getElementsByClassName("folder-box-item-children" + index)[0]
            .classList.contains("folder-box-item-childrenOn")) {
            document.getElementsByClassName("folder-box-item-children" + index)[0]
                .classList.remove("folder-box-item-childrenOn")
            setFolderIndex("");
        } else {
            setFolderIndex(index);
            dispatch(setSessionId(""));
            // 获取项目会话记录
            if (item.id) {
                folderGetChatListFn(item.id)
            }
        }
    }
    // 获取项目会话记录
    const folderGetChatListFn = (id) => {
        folderGetChatList(id).then((res) => {
            if (res.code === 0) {
                setFolderChatList(res.data)
            } else {
                messageApi.error(res.msg);
            }
        });
    }
    // 拖拽
    const sortableList = () => {
        let folderSortable = new Sortable(folderItems.current, {
            handle: ".folder-items-lis",
            animation: 150,
            dataIdAttr: "data-id",
            // 结束拖动事件
            onEnd: (evt) => {
                // 文件夹排序
                getFolderChatListSort({
                    engineerIds: folderSortable.toArray(),
                }).then((res) => {
                    if (res.code === 0) {
                    } else {
                        messageApi.error(res.msg);
                    }
                });
            },
        });
        let questionSortable = new Sortable(questionItems.current, {
            animation: 150,
            handle: ".question-list-items",
            sort: false, // 设为false，禁止sort
            // 开始拖拽的时候
            onStart: function (/**Event*/evt) {
                folderDragEnterClear()
            },
            // 结束拖动事件
            onEnd: (evt) => {
                let toId = folderDragEnterItem.id;
                let sessionId = evt.item.getAttribute("data-msgid");
                if (toId && sessionId) {
                    leftItemListMove(0, sessionId, toId, "folderMoveTo");
                    setFolderIndex(folderDragEnterIndex)
                }
            }
        });
        const folderChildrenItem = document.querySelectorAll(".folder-box-item-children");
        folderChildrenItem.forEach((item) => {
            let folderChildrenSortable = new Sortable(item, {
                animation: 150,
                handle: ".folder-question-items",
                sort: false, // 设为false，禁止sort
                // 开始拖拽的时候
                onStart: function (/**Event*/evt) {
                    folderDragEnterClear()
                },
                // 结束拖动事件
                onEnd: (evt) => {
                    let fromId = evt.from.getAttribute("data-id");
                    let toId = folderDragEnterItem.id;
                    let sessionId = evt.item.getAttribute("data-msgid");
                    if (JSON.stringify(folderDragEnterItem) !== "{}" && folderDragEnterItem.type !== "queBox" && fromId !== toId) {
                        leftItemListMove(fromId, sessionId, toId, "folderMove");
                    }
                    if (folderDragEnterItem.type === "queBox") {
                        leftItemListMove(fromId, sessionId, 0, "folderMoveOut");
                    }
                }
            });
        });

    };
    // 存移动的文件夹item
    const folderDragEnter = (e, item, index) => {
        folderDragEnterItem = item
        folderDragEnterIndex = index
    };
    const folderDragEnterClear = () => {
        folderDragEnterItem = {};
        folderDragEnterIndex = ""
    }
    const queDragEnter = (e) => {
        folderDragEnterItem = {
            type: "queBox"
        };
    }
    /**
     * 移动项目会话记录
     * fromId 移出项目ID
     * sessionId  会话ID
     * toId 移入项目ID
     * type  folderMove文件夹之间移动   folderMoveOut移出文件夹  folderMoveTo移入文件夹
     */
    const leftItemListMove = (fromId, sessionId, toId, type) => {
        let params = {
            "from": fromId ? fromId : 0,
            "sessionId": sessionId ? sessionId : 0,
            "to": toId ? toId : 0
        }
        getFolderChatMove(params).then((res) => {
            if (res.code === 0) {
                if (type === "folderMove" || type === "folderMoveOut") {
                    folderGetChatListFn(fromId)
                }
                if (type === "folderMoveTo") {
                    folderGetChatListFn(toId)
                }
                getFolderChatLists();
            } else {
                messageApi.error(res.msg);
            }
        });
    };

    return (
        <div className="App">
            {contextHolder}
            <button
                className="openleft"
                onClick={() => {
                    menuref.current.style.display = "block";
                }}
            >
                <MenuFoldOutlined/>
            </button>
            <div className="plugins-list" ref={menuref}>
                <div className="page-list">
                    <button
                        className="closeleft"
                        onClick={() => {
                            menuref.current.style.display = "none";
                        }}
                    >
                        <CloseCircleOutlined/>
                    </button>
                    <div className={"my-new-btnbox"}>
                        <Button
                            className="my-new-message"
                            onClick={() => {
                                createMessage();
                            }}
                            style={{width: "85%"}}
                            ghost
                        >
                            <PlusOutlined/> 新聊天
                        </Button>
                        <Button className='icon_btn' onClick={goClickPrompt} ghost title="click-flow-prompt"
                                icon={<AppstoreAddOutlined/>}/>
                        <Button className='icon_btn' ghost onClick={goClickClickFlow} title="前往prompt"
                                icon={<BranchesOutlined/>}/>
                        {/*<div
              className={"click-prompt-btn"}
              title="前往prompt"
              onClick={() => goClickPrompt()}
            >
              <AppstoreAddOutlined style={{fontSize: 20}}/>
            </div>
            <div
                className={"click-prompt-btn"}
                title={"click-flow-prompt"}
                onClick={() => goClickClickFlow()}
            >
              <MacCommandOutlined style={{fontSize: 20}}/>
            </div>*/}
                    </div>

                    <Button
                        className="my-new-folder"
                        style={{
                            width: "100%",
                            margin: "10px 0",
                        }}
                        ghost
                        onClick={() => {
                            createFolder();
                        }}
                    >
                        <PlusOutlined/> 新建文件夹
                    </Button>
                    <div className="question-list">
                        <div className={"folder-items-box"} ref={folderItems}>
                            {
                                folderList.map((item, index) => {
                                    return (
                                        <div className={[!item.hasInput ? "folder-items-lis" : "",
                                            "folder-items-lis" + item.id].join(" ")}
                                             onDragEnter={(e) => folderDragEnter(e, item, index)}
                                             data-id={item.id}
                                             key={index}>
                                            <div
                                                className={[
                                                    "question-item folder-items break-all",
                                                    folderIndex === index && "acv-item"
                                                ].join(" ")}
                                                data-class="folder-items"
                                                onClick={() => folderLiClick(item, index)}
                                            >
                                                <div className="folder-box">
                                                    <div className="folder-box-item">
                                                        <div className="folder-box-item-l">
                                                            <RightOutlined className={"folder-box-item-iconl"}/>
                                                            {
                                                                item.hasInput && folderIndex === index ?
                                                                    <input
                                                                        ref={folderInputRef}
                                                                        maxLength="50"
                                                                        style={{
                                                                            color: "#666",
                                                                            width: "105px",
                                                                            margin: "0 10px",
                                                                            fontSize: "13px",
                                                                            border: 0,
                                                                            outline:'none'
                                                                        }}
                                                                        className={"folder-box-item-input" + index}
                                                                        onChange={(e) => editFolderTitle(e, item)}
                                                                        value={item.title}
                                                                    />
                                                                    : <span className={"folder-box-item-title"}
                                                                            title={item.title + "(" + item.promptEngineerCount + "聊天)"}>
                                                                              <span style={{marginRight: 4}}>{item.title}</span>
                                                                              (<i className={"folder-box-item-titlenum" + item.id}>{item.promptEngineerCount}</i>聊天)
                                                                        </span>
                                                            }
                                                        </div>
                                                        {
                                                            item.hasInput && folderIndex === index ?
                                                                <div className={"folder-icons"}
                                                                     onClick={(e) => {
                                                                         e.stopPropagation()
                                                                     }}>
                                                                    <CheckOutlined
                                                                        onClick={(e) => addFolder(item, index, e)}/>
                                                                    <CloseOutlined
                                                                        onClick={(e) => edtiorFolderClose(item, index, e)}/>
                                                                </div>
                                                                : <div className={"folder-icons"}
                                                                       onClick={(e) => {
                                                                           e.stopPropagation()
                                                                       }}>
                                                                    <EditOutlined
                                                                        onClick={(e) => {
                                                                            editFolder(item, index, e);
                                                                        }}
                                                                    />
                                                                    &nbsp;{" "}
                                                                    <Popconfirm
                                                                        placement="top"
                                                                        title={"删除"}
                                                                        description={"删除后无法恢复,是否删除"}
                                                                        onConfirm={() => rmFolder(item, index)}
                                                                        okText="确定"
                                                                        cancelText="取消"
                                                                    >
                                                                        <DeleteOutlined/>
                                                                    </Popconfirm>
                                                                </div>
                                                        }
                                                    </div>

                                                    <div
                                                        className={["folder-box-item-children folder-box-item-children" + index,
                                                            folderIndex === index ? "folder-box-item-childrenOn" : ""].join(" ")}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                        }}
                                                        data-id={item.id}
                                                    >
                                                        {
                                                            folderChatList.map((items, indexs) => {
                                                                return (
                                                                    <div
                                                                        className={[
                                                                            "question-item question-items break-all",
                                                                            sessionId === items.sessionId && "acv-item",
                                                                            editId !== items.sessionId ? "folder-question-items" : "",
                                                                        ].join(" ")}
                                                                        key={indexs}
                                                                        data-msgid={items.sessionId}
                                                                    >
                                                                        <div>
                                                                            <div
                                                                                style={{
                                                                                    display: "flex",
                                                                                    alignItems: "center"
                                                                                }}
                                                                                onClick={(e) => {
                                                                                    getMessageItem(items, e, "folderChildren");
                                                                                }}
                                                                            >
                                                                                <CommentOutlined/>
                                                                                {editId === items.sessionId ? (
                                                                                    <input
                                                                                        ref={inputref}
                                                                                        maxLength="50"
                                                                                        style={{
                                                                                            color: "#666",
                                                                                            width: "95px",
                                                                                            margin: "0 10px",
                                                                                            fontSize: "13px",
                                                                                            border: 0,
                                                                                            outline:'none'
                                                                                        }}
                                                                                        value={items.sessionName}
                                                                                        onChange={(e) => editMessageTitle(e, items, "folderChildren")}
                                                                                        onBlur={() => {
                                                                                            setMessageTitle(items, "folderChildren", item);
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <span
                                                                                        style={{
                                                                                            marginLeft: "10px",
                                                                                            whiteSpace: "nowrap",
                                                                                            overflow: "hidden",
                                                                                            textOverflow: "ellipsis",
                                                                                            width: "95px",
                                                                                            display: "inline-block",
                                                                                        }}
                                                                                    >
                                                {items.sessionName}
                                              </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <EditOutlined
                                                                                onClick={() => {
                                                                                    editMessage(items, "folderChildren", item);
                                                                                }}
                                                                            />
                                                                            &nbsp;{" "}
                                                                            <Popconfirm
                                                                                placement="top"
                                                                                title={"删除"}
                                                                                description={"删除后无法恢复,是否删除"}
                                                                                onConfirm={() => rmMessage(items, indexs, "folderChildren", item)}
                                                                                okText="确定"
                                                                                cancelText="取消"
                                                                            >
                                                                                <DeleteOutlined/>
                                                                            </Popconfirm>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        <div className={"question-items-box"} ref={questionItems}
                             onDragEnter={(e) => queDragEnter(e)}>
                            {datalist.map((item, index) => {
                                return (
                                    <div
                                        className={[
                                            "question-item question-items break-all",
                                            sessionId === item.sessionId && "acv-item",
                                            editId !== item.sessionId ? "question-list-items" : "",
                                        ].join(" ")}
                                        key={index}
                                        data-msgid={item.sessionId}
                                        onClick={() => {
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{display: "flex", alignItems: "center"}}
                                                onClick={() => {
                                                    getMessageItem(item);
                                                }}
                                            >
                                                <CommentOutlined/>
                                                {editId === item.sessionId ? (
                                                    <input
                                                        ref={inputref}
                                                        maxLength="50"
                                                        style={{
                                                            color: "#666",
                                                            width: "105px",
                                                            margin: "0 10px",
                                                            fontSize: "13px",
                                                            border: 0,
                                                            outline:'none'
                                                        }}
                                                        value={item.sessionName}
                                                        onChange={(e) => editMessageTitle(e, item)}
                                                        onBlur={() => {
                                                            setMessageTitle(item);
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        style={{
                                                            marginLeft: "10px",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            width: "105px",
                                                            display: "inline-block",
                                                        }}
                                                    >
                            {item.sessionName}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <EditOutlined
                                                onClick={() => {
                                                    editMessage(item);
                                                }}
                                            />
                                            &nbsp;{" "}
                                            <Popconfirm
                                                placement="top"
                                                title={"删除"}
                                                description={"删除后无法恢复,是否删除"}
                                                onConfirm={() => rmMessage(item, index)}
                                                okText="确定"
                                                cancelText="取消"
                                            >
                                                <DeleteOutlined/>
                                            </Popconfirm>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {pageLoading && (
                            <div
                                style={{
                                    textAlign: "center",
                                    color: "#666",
                                    fontSize: "13px",
                                    marginTop: "10px",
                                }}
                            >
                                加载中...
                            </div>
                        )}
                    </div>

                    <p style={{textAlign: "center"}}> {realName}</p>
                    <Button
                        className='change_password_btn'
                        ghost
                        style={{width: "100%", margin: "10px 0"}}
                        onClick={() => {
                            setOpen(true);
                            JSON.parse(localStorage.getItem("userInfo")) &&
                            setdefaultPassword(
                                JSON.parse(localStorage.getItem("userInfo")).defaultPassword
                            );
                        }}
                    >
                        <LogoutOutlined/> 修改密码
                    </Button>
                    <Button className='logout_btn' ghost style={{width: "100%"}} onClick={() => isOutLogin()}>
                        <LogoutOutlined/> 退出登录
                    </Button>
                </div>
            </div>
            <div className="page-view">
                <div className="page-content">
                    <Outlet/>
                </div>
            </div>
            <Modal
                title="修改密码"
                okText="确认"
                cancelText="取消"
                keyboard="false"
                open={open}
                onOk={handleOk}
                width="300px"
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <div style={{display: "flex", flexDirection: "column"}}>
                    <p style={{marginLeft: "20px"}}>用户名: {userName}</p>
                    <p style={{marginLeft: "20px"}}>默认密码: {defaultPassword}</p>
                    <Input
                        placeholder="输入旧密码"
                        maxLength="16"
                        value={oldPwd}
                        onChange={(e) => {
                            setOldPwd(e.target.value);
                        }}
                        style={{width: "220px", margin: "0px auto"}}
                    ></Input>
                    <Input
                        placeholder="输入新密码"
                        maxLength="16"
                        value={newPwd}
                        onChange={(e) => {
                            setNewPwd(e.target.value);
                        }}
                        style={{width: "220px", margin: "15px auto"}}
                    ></Input>
                </div>
            </Modal>
        </div>
    );
}

export default App;
