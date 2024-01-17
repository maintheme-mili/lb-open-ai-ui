import {Tree, Spin, message, Button, Modal, Form, Input, TreeSelect} from 'antd';
import React, {useEffect, useState} from 'react';
import {deleteProject, getProjectsList, updateProject} from '../../../../server/prompsSever';
import {doingData} from './helper';
import './index.less';

const MueList = ({handleKey}) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [currentVal, setCurrentVal] = useState('');
    const [loading, setLoading] = useState(true);
    const [contextMenuPosition, setContextMenuPosition] = useState({});
    const [actionNodeData, setActionNodeData] = useState({});
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [editModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        projectsLists();
        window.addEventListener('click', closeContextMenu)
        return () => {
            window.removeEventListener('click', closeContextMenu)
        }
    }, []);

    const closeContextMenu = () => {
        setContextMenuPosition({});
    }

    const renderContextMenu = () => {
        if (contextMenuPosition.x && contextMenuPosition.y) {
            return (
                <div
                    className='context_menu'
                    style={{
                        left: contextMenuPosition.x,
                        top: contextMenuPosition.y
                    }}
                >
                    <Button block type='text' onClick={handleEdit}>编辑</Button>
                    <Button block type='text' danger onClick={handleDelete}>删除</Button>
                </div>
            )
        }
    }

    const handleEdit = (e) => {
        e.stopPropagation();
        closeContextMenu();
        setEditModalVisible(true);
        form.setFieldsValue({
            title: actionNodeData.label,
            parentId: actionNodeData.parentId === '-1' ? null : actionNodeData.parentId
        })
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        closeContextMenu();
        Modal.confirm({
            title: '提示',
            content: '删除后无法恢复，确定删除吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                deleteProject(actionNodeData.key).then(res => {
                    if (res.code === 0) {
                        message.success('删除成功！');
                        projectsLists(null, actionNodeData.key === selectedKeys[0] ? 'selectFirst' : null)
                    }
                }).finally(() => {
                    return Promise.resolve();
                })
            }
        })
    }

    /**
     * 获取左侧列表
     */
    const projectsLists = async (parentId, type) => {
        try {
            const results = await getProjectsList({parentId, type: 'flow'});
            if (results.code === 0) {
                const treeData = doingData(results.data)
                setCurrentVal(treeData[0]?.key);
                handleKey(treeData[0]?.key);
                setItems([...treeData]);
                if (type === 'selectFirst') {
                    setSelectedKeys([treeData[0]?.key])
                }
            }
            setLoading(false)
        } catch (err) {
            setLoading(false)
            throw new Error(err);
        }
    }

    const handleSelectItem = (itemVal) => {
        const [key] = itemVal;
        setSelectedKeys([key]);
        handleKey(key);
    }

    const handleSubmit = () => {
        form.validateFields().then(value => {
            updateProject(actionNodeData.key, {...value}).then(res => {
                if (res.code === 0) {
                    message.success('编辑成功！');
                    setEditModalVisible(false)
                    form.resetFields();
                    projectsLists();
                }
            })
        })
    }

    const formProps = {
        form,
        labelCol: {
            span: 4
        },
        wrapperCol: {
            span: 20
        }
    }

    return <>
        {renderContextMenu()}
        <Modal
            title='编辑项目'
            open={editModalVisible}
            onCancel={() => {
                setEditModalVisible(false)
                form.resetFields();
            }}
            onOk={handleSubmit}
            okText='确定'
            cancelText='取消'
        >
            <Form {...formProps}>
                <Form.Item label='上级项目' name='parentId'>
                    <TreeSelect
                        placeholder='请选择上级项目'
                        treeData={items}
                        showSearch
                        filterTreeNode={(inputValue, treeNode) => {
                            return treeNode.label.indexOf(inputValue) > -1
                        }}
                    />
                </Form.Item>
                <Form.Item label='项目名称' name='title' rules={[{required: true, message: '请输入项目名称'}]}>
                    <Input placeholder='请输入项目名称'/>
                </Form.Item>
            </Form>
        </Modal>
        <Spin spinning={loading} delay={500} tip='加载中' style={{width: '100%', height: '300px'}}>
            {
                !loading && <div className='ChartCard'>
                    <Tree
                        showIcon
                        defaultExpandAll
                        blockNode
                        defaultSelectedKeys={[currentVal]}
                        selectedKeys={selectedKeys}
                        treeData={items}
                        onSelect={handleSelectItem}
                        rootStyle={{width: '100%', borderRadius: '0px', background: ''}}
                        className='treeClass'
                        onRightClick={({event, node}) => {
                            event.stopPropagation();
                            setActionNodeData(node);
                            setContextMenuPosition({
                                x: event.pageX,
                                y: event.pageY
                            })
                        }}
                    />
                </div>
            }
        </Spin>
    </>
}


export default MueList;
