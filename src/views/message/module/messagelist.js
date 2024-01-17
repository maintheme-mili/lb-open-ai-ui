/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-03-10 11:46:11
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-17 15:38:48
 */
import {Button, Input, List, message, Modal, Spin} from "antd";
import {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useEffect,
} from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import ChatTools from "./component/ChatTools";
import { SaveOutlined } from '@ant-design/icons';
const MessageList = forwardRef((props, ref) => {
    const [avatar, setAvatar] = useState("");
    useImperativeHandle(ref, () => ({
        // 暴露给父组件的方法
        scrollY,
    }));

    useEffect(() => {
        if (localStorage.getItem("userInfo")) {
            setAvatar(JSON.parse(localStorage.getItem("userInfo")).avatar);
        }
    }, []);

    /**
     * 滚动条到底部
     */
    const scrollY = () => {
        scrollyRef.current.scrollTo(0, scrollyRef.current.scrollHeight);
    };

    const lastIndex = (props.messageList?.length || 0) - 1
    const scrollyRef = useRef(null);
    /**
     * 消息回复文案
     * @param {String} text
     * @returns
     */
    const setContent = (id, text, error, item) => {
        const _text = decodeURIComponent(text)
        return (
            <div className={"response-box"}>
                <MarkdownPreview
                    style={{ background: "#efefef" }}
                    disableCopy={false}
                    wrapperElement={{"data-color-mode": "light"}}
                    source={error || _text}
                />
                {
                    text && <ChatTools chatList={props.messageList} dialog={item} avatar={avatar}/>
                }
            </div>
        );
    };
    return (
        <div className="message-list-box" ref={scrollyRef}>
            {
                props.messageList?.map((item, index) => {
                    return (
                        <div key={index} className="content-item">
                            <h1>
                                <span className="user-image">
                                    {avatar ? <img width="100%" src={avatar} alt="" /> : "Me"}
                                </span>{" "}
                                <MarkdownPreview
                                    source={ item.prompt.replace(/\n/g, "<br/>")}
                                />
                                {
                                    (item.response || item.errorMsg) && (!item.promptArrangeId &&
                                        <Button title='保存' icon={<SaveOutlined />} shape="circle"
                                            style={{ marginLeft: 'auto' }}
                                            onClick={() => {
                                                props.savePrompt && props.savePrompt(item);
                                            }} />)
                                }
                            </h1>
                            <div className="message-items">
                                <div className="ai-content-box">
                                    <div>
                                        <span className="user-image">Ai</span>
                                    </div>
                                    <div
                                        className={!item.failFlag && item.response ? 'ai-answer' : 'ai-answer ai-error'}>
                                        {props.envMsgStatus === '[LOADING]' && lastIndex === index ? (
                                            <Spin/>
                                        ) : !item.failFlag ? setContent(item.id, item.response, item.errorMsg, item) : '服务器繁忙, 请稍后重试~'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            }
        </div>
    );
});
export default MessageList;
