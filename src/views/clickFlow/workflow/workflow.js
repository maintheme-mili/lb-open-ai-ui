import "./workflow.less";
import Flow from "./flow";
import EditorStep from "./editorStep";
import {useAvatar, usePrompt} from "./workflowService";
import {useLocation} from "react-router";
import {Button, Spin} from "antd";
import {promptPreview, promptPreviewAll} from "@/server/clickFlow";
import {createRef, useEffect, useState} from "react";

export default function Workflow() {
    const location = useLocation();
    const [loading, savePrompt, prompts, parents, setPrompts] = usePrompt({
        engineerId: location?.state?.id || '',
        promptName: "",
    });
    const [executeAllLoading, setExecuteAllLoading] = useState(false);
    const [promptRefs, setPromptRefs] = useState({});

    const avatar = useAvatar();

    const onSubmit = async (engineerId, id, index) => {
        try {
            const res = await promptPreview({engineerId, id});
            prompts[index].response = res.data[0].response;
            setPrompts([...prompts]);
        } catch (e) {
            prompts[index].response = "服务器异常!";
            setPrompts([...prompts]);
        }
    };

    const addPrompt = () => {
        setPrompts([
            ...prompts,
            {
                promptName: "",
                promptContent: "",
                parentId:
                    prompts.length > 0
                        ? prompts.filter((item) => !!item.id).pop().id
                        : "",
            },
        ]);
    };

    const handleExecuteAll = () => {
        setExecuteAllLoading(true);
        promptRefs.forEach(item => {
            item.current.updateHistory()
        })
        promptPreviewAll({engineerId: location?.state?.id, id: prompts[0].id}).then(res => {
            if (res.code === 0) {
                res.data.forEach(item => {
                    const findIndex = prompts.findIndex(findItem => findItem.id === item.id);
                    findIndex > -1 && promptRefs[findIndex].current.updateHistory({
                        response: item.response
                    })
                })
            }
        }).finally(() => {
            setExecuteAllLoading(false);
        })
    }

    useEffect(() => {
        const list = prompts.map(item => createRef());
        setPromptRefs([...list])
    }, [prompts])

    return (
        <div id="work-flow">
            <div className="flow_container">
                <Flow prompts={prompts}/>
            </div>
            <div className="work-flow-title">{location?.state?.title}</div>
            <div className="work-flow-steps">
                <Spin spinning={loading}/>
                <Button type='primary' style={{width: 120}} onClick={handleExecuteAll} loading={executeAllLoading}>
                    执行全部
                </Button>
                {
                    prompts.map(
                        (
                            {promptName, promptContent, id, parentId, promptResult = "", enabled},
                            index
                        ) => (
                            <EditorStep
                                editorStepRef={promptRefs[index]}
                                key={index}
                                engineerId={location?.state?.id}
                                id={id}
                                index={index}
                                parentId={parentId}
                                prompts={prompts}
                                setPrompts={setPrompts}
                                onSave={async (v, changeEnable) =>
                                    await savePrompt(v, changeEnable)
                                }
                                step={index + 1}
                                title={promptName}
                                article={promptContent}
                                parents={parents}
                                response={promptResult}
                                enabled={enabled}
                                avatar={avatar}
                                onSubmit={() => onSubmit(location?.state?.id, id, index)}
                            />
                        )
                    )
                }
                <Button
                    type="default"
                    onClick={addPrompt}
                    disabled={prompts.length === 1 && prompts[0].id === undefined}
                >
                    <i className="iconfont icon-xinjian"></i>
                </Button>
            </div>
        </div>
    );
}
