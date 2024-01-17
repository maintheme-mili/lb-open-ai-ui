import React, {useState} from 'react';
import {Button, Modal, Radio, Spin, Tooltip} from 'antd';
import style from './index.less';
import html2canvas from 'html2canvas';
import MarkdownPreview from '@uiw/react-markdown-preview';
import {ExportOutlined} from '@ant-design/icons';
import chatSvg from '../../../../../static/chat-to-work.svg'
import {SaveOutlined} from "@ant-design/icons";


const ChatTools = ({
                       dialog,
                       chatList,
                       avatar
                   }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [value, setValue] = useState(1);

    // 保存图片
    const [imgUrl, setImgUrl] = useState('');
    const [imgAllUrl, setAllImgUrl] = useState('');

    const handleOk = () => {
        setIsModalOpen(true);
    };

    const onChange = (e) => {
        setValue(e.target.value);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setValue(1);
    };

    //导出图片
    const exportCanvasImg = () => {
        setIsModalOpen(true);
    };

    //保存图片
    const saveImg = () => {
        if (value === 1) {
            html2canvasHandle('canvas_left');
        } else {
            html2canvasHandle('canvas_right');
        }
    };

    //刷新
    const refresh = () => {
        // operateChat();
    };

    const html2canvasHandle = (eleId) => {
        const count = eleId === 'canvas_left' ? 16 : 143;
        const element = document.getElementById(eleId);
        const elementWidth = element.offsetWidth; // 元素宽度(52 可选，根据实际情况而定)
        const elementHeight = element.offsetHeight + count; // 元素高度
        const canvas = document.createElement('canvas');
        canvas.width = elementWidth * 2; // 如下载的图片不是很清楚可以放大
        canvas.height = elementHeight * 2; // 如下载的图片不是很清楚可以放大
        canvas.style.width = elementWidth + 'px';
        canvas.style.height = elementHeight + 'px';
        const context = canvas.getContext('2d');
        context.scale(1, 1); // 如下载的图片不是很清楚可以放大
        html2canvas(element, {
            //superMap整个页面的节点
            backgroundColor: null, //画出来的图片有白色的边框,不要可设置背景为透明色（null）
            allowTaint: true,
            useCORS: true, //支持图片跨域
            scale: 2,
            canvas,
        })
            .then((canvas) => {
                //截图用img元素承装，显示在页面的上
                const imgData = canvas.toDataURL('image/png'); // toDataURL :图片格式转成 base64
                const a = document.createElement('a');
                a.href = imgData;
                // 设置a标签的下载属性和文件名
                a.download = 'ai_screenshot.png';
                // 触发点击事件，使浏览器下载图片
                a.click();
            })
            .catch((err) => {
            });
    };

    return (
        <>
            <div className="chat_tool_container">
                <Button size='small' className="export_btn" onClick={exportCanvasImg}>
                    <ExportOutlined/>
                    导出
                </Button>
            </div>
            <Modal
                width={'735px'}
                footer={null}
                wrapClassName="modal_container"
                open={isModalOpen}
                onOk={handleOk}
                centered
                onCancel={handleCancel}
                maskStyle={{
                    background: 'rgba(255,255,255,0.9)',
                }}
            >
                <div className="title_con">
                    {'生成截图'}
                </div>
                <Radio.Group
                    className="radio_tabs"
                    onChange={onChange}
                    value={value}
                >
                    <Radio value={1}>{'单条对话'}</Radio>
                    <Radio value={2}>{'完整对话'}</Radio>
                </Radio.Group>
                <div className="canvas_upload">
                    {value === 1 ? (
                        <div className="canvas_left_container">
                            <div className="canvas_left" id="canvas_left">
                                <div className="content-item">
                                    <h1>
                                <span className="user-image">
                                    {avatar ? <img width="100%" src={avatar} alt=""/> : "Me"}
                                </span>{" "}
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: dialog.prompt
                                            }}
                                        />
                                    </h1>
                                    <div className="message-items">
                                        <div className="ai-content-box">
                                            <div>
                                                <span className="user-image">Ai</span>
                                            </div>
                                            <div className="ai-answer">
                                                <div className={"response-box"}>
                                                    <MarkdownPreview
                                                        style={{background: "#efefef"}}
                                                        disableCopy={false}
                                                        wrapperElement={{"data-color-mode": "light"}}
                                                        source={dialog.response}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="canvas_right">
                            <div className="canvas_right_con" id="canvas_right">
                                {
                                    chatList.map((item, index) => (
                                        <div className="content-item" key={index}>
                                            <h1>
                                <span className="user-image">
                                    {avatar ? <img width="100%" src={avatar} alt=""/> : "Me"}
                                </span>{" "}
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: item.prompt
                                                    }}
                                                />
                                            </h1>
                                            <div className="message-items">
                                                <div className="ai-content-box">
                                                    <div>
                                                        <span className="user-image">Ai</span>
                                                    </div>
                                                    <div className="ai-answer">
                                                        <div className={"response-box"}>
                                                            <MarkdownPreview
                                                                style={{background: "#efefef"}}
                                                                disableCopy={false}
                                                                wrapperElement={{"data-color-mode": "light"}}
                                                                source={item.response}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>

                <div className="download_btn" onClick={saveImg}>
                    {/*<div className="save_icon"/>*/}
                    {'保存截图'}
                </div>
            </Modal>
        </>
    );
};

export default ChatTools;
