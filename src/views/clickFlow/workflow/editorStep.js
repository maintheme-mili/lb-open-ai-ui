import {MarkdownEditor} from "@remirror/react-editors/markdown";
import {OnChangeHTML} from "@remirror/react-core";
import React, {useImperativeHandle, useRef, useState} from "react";
import {Button, Input, Select, Spin, Card} from "antd";
import {extractTextFromHTML} from "@/utils/utils";
import {LoadingOutlined} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import {useHistory} from "./workflowService";
import remarkGfm from "remark-gfm";

const antIcon = <LoadingOutlined style={{fontSize: 24}} spin/>;

export default function EditorStep({
                                       onSubmit,
                                       title,
                                       article,
                                       step,
                                       onSave,
                                       engineerId,
                                       id,
                                       parents,
                                       parentId,
                                       response,
                                       index,
                                       setPrompts,
                                       prompts,
                                       enabled,
                                       avatar,
                                       editorStepRef
                                   }) {
    const [caption, setCaption] = useState(title);
    const [content, setContent] = useState(article);
    const [parentid, setParentid] = useState(parentId);
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [enabledLoading, setEnabledLoading] = useState(false);
    const history = useRef();

    const [histories, setHistories] = useHistory(
        {engineerId, id},
        response,
        content,
        history
    );

    const save = async (changeEnable = false) => {
        !changeEnable && setSaveLoading(true);
        !changeEnable && setChanged(false);
        changeEnable && setEnabledLoading(true);
        try {
            onSave &&
            (await onSave(
                {
                    engineerId,
                    promptName: caption,
                    parentId: parentid,
                    promptContent: content,
                    id,
                },
                changeEnable
            ));
            let timer = setTimeout(() => {
                document
                    .querySelector(
                        ".react-flow__controls-button.react-flow__controls-fitview"
                    )
                    .click();
                clearTimeout(timer);
            }, 100);
        } catch (e) {
            !changeEnable && setChanged(true);
        }
        !changeEnable && setSaveLoading(false);
        changeEnable && setEnabledLoading(false);
    };

    useImperativeHandle(editorStepRef, () => ({
        updateHistory: (data) => {
            if (data) {
                setLoading(false)
                histories[histories.length - 1].response = data.response;
                setHistories([...histories]);
            } else {
                setHistories([...histories, {prompt: content, response: ""}]);
                setLoading(true)
            }
        }
    }))

    const contentChange = (v) => {
        setChanged(true);
        setContent(v);
    };

    const titleChange = (v) => {
        setChanged(true);
        setCaption(v);
    };

    const parentIdChange = (v) => {
        setChanged(true);
        setParentid(v);
    };

    const submit = async () => {
        changed && (await save());
        setHistories([...histories, {prompt: content, response: ""}]);
        let timer = setTimeout(() => {
            history.current?.scrollTo(0, history.current?.scrollHeight);
            clearTimeout(timer);
        });
        setLoading(true);
        onSubmit && (await onSubmit());
        setLoading(false);
    };

    const delPrompt = () => {
        let cpyPrompts = [...prompts];
        cpyPrompts.pop();
        setPrompts(cpyPrompts);
    };

    return (
        <div className="step-item">
            <Card bordered={false} title={<div className="item-title">
                <div className="item-title">
                    Step {step}.
                    <Input
                        className="title-input"
                        value={caption}
                        onChange={(e) => titleChange(e.target.value)}
                    />
                    {index !== 0 && (
                        <>
                            <span className="title-select-label">父节点：</span>
                            <Select
                                className="title-select"
                                value={parentid === "-1" ? "" : parentid}
                                onChange={parentIdChange}
                                options={parents
                                    .filter((item) => item.id !== id)
                                    .map(({promptName, id}) => ({
                                        label: promptName,
                                        value: id,
                                    }))}
                            />
                        </>
                    )}
                </div>
            </div>}>
                <div className="grey-bg">
                <span className="item-avatar">
                  <div className="avatar-img">PH</div>
                </span>
                    <div className="item-editor-content">
                        <MarkdownEditor initialContent={content}>
                            <OnChangeHTML
                                onChange={(v) => contentChange(extractTextFromHTML(v))}
                            />
                        </MarkdownEditor>
                    </div>
                </div>
                <div className="item-prompt">
                    <div className="prompt-wrapper">
                        <Button
                            disabled={!id || loading}
                            className="prompt-button"
                            size='small'
                            type="primary"
                            onClick={submit}
                        >
                            Prompt
                        </Button>
                        <Button
                            type="primary"
                            size='small'
                            className="prompt-button"
                            loading={saveLoading}
                            disabled={!changed}
                            onClick={() => save()}
                        >
                            保存
                        </Button>
                        {!id && (
                            <Button
                                danger
                                size='small'
                                className="prompt-button"
                                onClick={delPrompt}
                            >
                                删除
                            </Button>
                        )}
                        {id !== undefined && (
                            <Button
                                loading={enabledLoading}
                                size='small'
                                danger={enabled}
                                onClick={() => save(true)}
                            >
                                {enabled ? "禁用" : "启用"}
                            </Button>
                        )}
                    </div>
                </div>
                <Card bordered={false} title='prompt记录'>
                    <div className="item-history" ref={history}>
                        {histories.map((item, index) => (
                            <div key={index}>
                                <div className="item-response content self">
                                    <img src={avatar} className="response-openai"/>
                                    <div className={"response-box"}>
                                        <ReactMarkdown
                                            children={item.prompt
                                                .replace(/^([0-9]+)\./gm, "$1\\.")
                                                .replace(/\n+/g, "\n\n")}
                                            remarkPlugins={[remarkGfm]}
                                        />
                                    </div>
                                </div>
                                <div className="item-response content ai">
                                    <img src="/images/openai.svg" className="response-openai"/>
                                    <div className={"response-box"}>
                                        <Spin
                                            className="response-loading"
                                            indicator={antIcon}
                                            spinning={!item.response && loading}
                                        />
                                        <ReactMarkdown
                                            children={item.response
                                                .replace(/^([0-9]+)\./gm, "$1\\.")
                                                .replace(/\n+/g, "\n\n")}
                                            remarkPlugins={[remarkGfm]}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </Card>
        </div>
    );
}
