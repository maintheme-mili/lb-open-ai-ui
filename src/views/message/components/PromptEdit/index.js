import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Spin, Card, TreeSelect } from "antd";
import { savePrompt, getParentTreeList, getProjectList, createProject } from "@/server/messageaapiList";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useAvatar, useHistory } from "@/views/clickFlow/workflow/workflowService";
import { visitTree } from '@/utils/tree';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { promptPreview } from "@/server/clickFlow";
import _ from 'lodash-es';
import moment from 'moment'
import './index.less';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { Item, useForm } = Form;
const { TextArea } = Input;
const PromptEdit = ({ promptEditRef, reload }) => {
    const avatar = useAvatar();
    const [visible, setVisible] = useState(false);
    const [form] = useForm();
    const [promptState, setPromptState] = useState({});
    const [editType, setEditType] = useState('create'); // 弹框状态  create-创建/保存  edit-编辑
    const [projectList, setProjectList] = useState([]);
    const [projectId, setProjectId] = useState('');
    const [engineerId, setEngineerId] = useState('');
    const [taskList, setTaskList] = useState([]);
    const [parentPromptList, setParentPromptList] = useState([]);
    const [createProjectFlag, setCreateProjectFlag] = useState(false);
    const [createTaskFlag, setCreateTaskFlag] = useState(false);
    const [loading, setLoading] = useState(false);
    const [promptResponse, setPromptResponse] = useState('');

    const history = useRef();
    const [histories, setHistories, asyncHistory] = useHistory(
        { engineerId: promptState.promptEngineerId, id: promptState.id },
        promptState.promptResult,
        promptState.promptContent,
        history
    );
    useEffect(() => {
        if (visible && editType === 'edit') {
            asyncHistory()
        }
    }, [promptState])


    useImperativeHandle(promptEditRef, () => ({
        openModal: (promptData, type) => {
            setVisible(true);
            setPromptState(promptData);
            setEditType(type);
            if (type === 'create') {
                form.setFieldsValue({
                    ...promptData,
                    promptContent: promptData.prompt,
                    promptName: promptData.prompt,
                    promptResult: promptData.response
                });
                queryProjectList();
            } else {
                form.setFieldsValue({
                    ...promptData,
                    engineerId: promptData.promptEngineerId,
                    parentId: promptData.parentId === '-1' ? null : promptData.parentId
                });
                setPromptResponse(promptData.promptResult)
                queryParentPromptList(promptData.promptEngineerId);
                queryProjectList();
                queryTaskList(promptData.projectId)
            }

        }
    }));

    const handleSubmit = async (value) => {
        const projectId = createProjectFlag ? await createProject({
            parentId: -1,
            title: value.projectId
        }) : value.projectId;
        const engineerId = createTaskFlag ? await createProject({
            parentId: createProjectFlag ? projectId.data.id : projectId,
            title: value.engineerId
        }) : value.engineerId;
        const params = {
            engineerId: createTaskFlag ? engineerId.data.id : engineerId,
            projectId: createProjectFlag ? projectId.data.id : projectId,
            parentId: value.parentId || -1,
            promptContent: value.promptContent,
            promptName: value.promptName,
            promptResult: value.promptResult,
        }
        if (editType === 'edit') {
            params.id = promptState.id;
        } else {
            params.sessionId = promptState.id;
        }
        const res = await savePrompt(params);
        if (res.code === 0) {
            message.success(`${editType === 'create' ? '保存' : '编辑'}成功`);
            handleCancel('reload');
        }
    }

    const queryTaskList = (parentId) => {
        getProjectList({parentId}).then(res => {
            if (res.code === 0) {
                setTaskList(res.data || []);
            }
        })
    }

    const queryProjectList = () => {
        getProjectList({parentId: -1}).then(res => {
            if (res.code === 0) {
                setProjectList(res.data || []);
            }
        })
    }

    const handleCancel = (type) => {
        form.resetFields();
        setVisible(false);
        setPromptState({});
        setEditType('create');
        setProjectList([]);
        setProjectId('');
        setEngineerId('');
        setTaskList([]);
        setParentPromptList([]);
        setCreateProjectFlag(false);
        setCreateTaskFlag(false);
        setHistories([]);
        if (type === 'reload') {
            reload && reload()
        }
    }

    const handleAddProject = (e) => {
        e.preventDefault();
        setProjectList([...projectList, {title: projectId, id: projectId, type: 'local'}])
        setProjectId('');
    }

    const handleAddTask = (e) => {
        e.preventDefault();
        setTaskList([...taskList, {title: engineerId, id: engineerId, type: 'local'}])
        setEngineerId('');
    }

    const queryParentPromptList = (promptEngineerId) => {
        getParentTreeList({promptEngineerId}).then(res => {
            if (res.code === 0) {
                const treeArray = [...res.data];
                visitTree(treeArray, (item) => {
                    item.key = item.id;
                    item.label = item.promptName;
                    item.value = item.id;
                });
                setParentPromptList(treeArray || [])
            }
        })
    }

    const onSubmit = async (engineerId, id, index, _histories) => {
        try {
            const res = await promptPreview({engineerId, id});
            _histories[index].response = res.data[0].response;
            setHistories([..._histories]);
        } catch (e) {
            _histories[index].response = '服务器异常';
            setHistories([..._histories]);
        }
        setLoading(false);
    };

    const handleTest = async () => {
        const _histories = _.cloneDeep(histories);
        _histories.push({prompt: form.getFieldValue('promptContent'), response: ""});
        await setHistories([..._histories]);
        let timer = setTimeout(() => {
            history.current?.scrollTo(0, history.current?.scrollHeight);
            clearTimeout(timer);
        });
        await onSubmit(promptState.promptEngineerId, promptState.id, _histories.length - 1, _histories);
        setLoading(true);
    }

    const formProps = {
        form,
        colon: false,
        onFinish: handleSubmit
    }

    return <Modal
        width={1000}
        style={{top: 20}}
        title={`${editType === 'create' ? '保存' : '编辑'}Prompt`}
        open={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={null}
        maskClosable={false}
        className='prompt_edit_modal'
    >
        <Form {...formProps}>
            <Row gutter={16}>
                <Col span={12}>
                    <Item label='项目' name='projectId' labelCol={{span: 6}}
                          rules={[{required: true, message: '请输入prompt归属项目'}]}>
                        <Select
                            showSearch
                            onChange={(value, e) => {
                                setTaskList([]);
                                setParentPromptList([]);
                                form.resetFields(['engineerId', 'parentId']);
                                if (e['data-type'] !== 'local') {
                                    queryTaskList(value);
                                    setCreateProjectFlag(false);
                                } else {
                                    setCreateProjectFlag(true)
                                }
                            }}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{margin: '8px 0'}}/>
                                    <Space style={{padding: '0 8px 4px'}}>
                                        <Input
                                            placeholder="请输入"
                                            value={projectId}
                                            onChange={e => setProjectId(e.target.value)}
                                        />
                                        <Button type="text" icon={<PlusOutlined/>} onClick={handleAddProject}
                                                disabled={!projectId}>
                                            添加项目
                                        </Button>
                                    </Space>
                                </>
                            )}>
                            {
                                projectList.length ? projectList.map((item, index) => <Select.Option value={item.id}
                                                                                                     data-type={item.type}
                                                                                                     key={index}>
                                    {item.title}
                                </Select.Option>) : null
                            }
                        </Select>
                    </Item>
                </Col>
                <Col span={12}>
                    <Item label='任务' name='engineerId' labelCol={{span: 6}}
                          rules={[{required: true, message: '请输入任务名称'}]}>
                        <Select
                            showSearch
                            onChange={(value, e) => {
                                setParentPromptList([]);
                                form.resetFields(['parentId']);
                                if (e['data-type'] !== 'local') {
                                    queryParentPromptList(value);
                                    setCreateTaskFlag(false);
                                } else {
                                    setCreateTaskFlag(true);
                                }
                            }}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{margin: '8px 0'}}/>
                                    <Space style={{padding: '0 8px 4px'}}>
                                        <Input
                                            placeholder="请输入"
                                            value={engineerId}
                                            onChange={e => setEngineerId(e.target.value)}
                                        />
                                        <Button type="text" icon={<PlusOutlined/>} onClick={handleAddTask}
                                                disabled={!engineerId}>
                                            添加任务
                                        </Button>
                                    </Space>
                                </>
                            )}>
                            {
                                taskList.length ? taskList.map((item, index) => <Select.Option value={item.id}
                                                                                               data-type={item.type}
                                                                                               key={index}>
                                    {item.title}
                                </Select.Option>) : null
                            }
                        </Select>
                    </Item>
                </Col>
                <Col span={12}>
                    <Item label='父节点' name='parentId' labelCol={{span: 6}}>
                        <TreeSelect
                            placeholder='请选择'
                            showSearch
                            treeData={parentPromptList}
                            filterTreeNode={(inputValue, treeNode) => {
                                return treeNode.label.indexOf(inputValue) > -1
                            }}
                        />
                    </Item>
                </Col>
                <Col span={24}>
                    <Item label='prompt标题' name='promptName'
                          rules={[{required: true, message: '请选择输入prompt标题'}]}
                          labelCol={{span: 3}}>
                        <Input/>
                    </Item>
                </Col>
                <Col span={24}>
                    <Item label='prompt' name='promptContent'
                          rules={[{required: editType === 'edit', message: '请输入prompt'}]}
                          className='prompt_label' labelCol={{span: 3}}>
                        <TextArea autoSize={{minRows: 4, maxRows: 6}} className='prompt_textarea'
                                  disabled={editType === 'create'}/>
                    </Item>
                </Col>
                <Col span={24}>
                    {
                        editType === 'edit' ? <Item label='prompt输出' labelCol={{span: 3}}>
                            <div className="markdown_container">
                                <ReactMarkdown
                                    children={promptResponse
                                        .replace(/^([0-9]+)\./gm, "$1\\.")
                                        .replace(/\n+/g, "\n\n")}
                                    remarkPlugins={[remarkGfm]}
                                />
                            </div>
                        </Item> : <Item label='prompt输出' name='promptResult' labelCol={{span: 3}}
                                        rules={[{required: editType === 'edit', message: '请输入prompt输出'}]}>
                            <TextArea className='prompt_textarea' disabled/>
                        </Item>
                    }
                </Col>
                {
                    editType === 'edit' && <Col span={24}>
                        <Card
                            title='prompt记录'
                            bordered={false}
                        >
                            <div className="item-history" ref={history}>
                                {histories.map((item, index) => (
                                    <div key={index}>
                                        <div className="item-response content self">
                                            <img alt='avatar' src={avatar} className="response-openai"/>
                                            <div className={"response-box"}>
                                                <ReactMarkdown
                                                    children={item.prompt
                                                        .replace(/^([0-9]+)\./gm, "$1\\.")
                                                        .replace(/\n+/g, "\n\n")}
                                                    remarkPlugins={[remarkGfm]}
                                                />
                                            </div>
                                            <span
                                                style={{marginLeft: 'auto'}}>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                                        </div>
                                        <div className="item-response content ai">
                                            <img src="/images/openai.svg" alt='openai' className="response-openai"/>
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
                    </Col>
                }
                <Col span={24} style={{marginTop: 16, textAlign: 'right'}}>
                    <Item>
                        {
                            editType === 'edit' && <Button style={{marginLeft: 8}} onClick={handleTest}>prompt调试</Button>
                        }
                        <Button style={{marginLeft: 8}} htmlType='submit' type='primary'>提交</Button>
                        <Button style={{marginLeft: 8}} onClick={handleCancel}>取消</Button>
                    </Item>
                </Col>
            </Row>
        </Form>
    </Modal>
};

export default PromptEdit;
