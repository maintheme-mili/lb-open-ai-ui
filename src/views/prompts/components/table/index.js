/*
 * @Description: Prompt Right
 */

import React, { useEffect, useRef, useState } from 'react';
import { Typography, Col, Form, Input, Row, Table, Divider, Button, Spin } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { getProjectsTableList, changeEnable, excelExport } from '../../../../server/prompsSever';
import { arrayMove } from '@dnd-kit/sortable';
import PromptEdit from "../../../message/components/PromptEdit";
import FlowModal from "../flowModal";
import { useNavigate } from "react-router-dom";
import './index.less';
import '@/global.less';

const { Link } = Typography;
const PAGE_NUM = 10;

const PromptRight = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    pageNo: 1,
    pageSize: PAGE_NUM,
    promptName: '',
    promptContent: '',
  });
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const promptEditRef = useRef();
  const promptSortRef = useRef();

  // 初始化接口信息
  useEffect(() => {
    props?.id && getTableList();
  }, [props.id, searchParams]);

  // 启用\停用接口
  const getChangeEnable = async (record) => {
    try {
      const result = await changeEnable({ id: record?.id, engineerId: record?.promptEngineerId });
      if (result?.code === 0) {
        getTableList();
      }
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  /**
   * 获取table数据
   */
  const getTableList = async () => {
    setLoading(true);
    const params = {
      promptEngineerId: props?.id,
      ...searchParams,
    }
    try {
      const result = await getProjectsTableList(params);
      setLoading(false);
      if (result.code === 0) {
        const { list, totalCount } = result?.data;
        setTableData(list ?? []);
        setTotal(totalCount);
      }
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  // 搜索
  const handleSearch = (values) => {
    setSearchParams({
      ...searchParams,
      ...values,
      current: 1
    })
  }

  // 重置方法
  const handleReset = () => {
    resetFields();
    setSearchParams({
      ...searchParams,
      current: 1,
      promptName: '',
      promptContent: '',
    })
  }

  // 导出prompts
  const handleExport = () => {
    setLoading(true);
    const params = new FormData();
    params.append('list', props.id)
    excelExport(params).then(res => {
      const { status, data } = res;
      if (status === 200) {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      }
      setLoading(false);
    })
  }

  // prompt编排
  const handleArrange = () => {
    navigate('/click-flow/workflow', {
      state: {
        id: props.id
      }
    })
  }

  /**
   * @description: columns 配置
   * @returns
   */
  const columns = [
    {
      key: 'sortNum',
      title: '同级排序',
      dataIndex: 'sortNum',
      align: 'center',
      width: 90,
    },
    {
      key: 'id',
      title: 'id',
      dataIndex: 'id',
      width: 180,
    },
    {
      key: 'parentId',
      title: '父节点',
      dataIndex: 'parentId',
      width: 170,
      render: (text, record) => {
        return <span>{text === '-1' ? '首节点' : text}</span>;
      },
    },
    {
      key: 'promptName',
      title: '标题',
      dataIndex: 'promptName',
      ellipsis: true,
    },
    {
      key: 'promptContent',
      title: 'Prompts',
      dataIndex: 'promptContent',
      ellipsis: true,
    },
    {
      key: 'promptResult',
      title: 'Prompts输出',
      dataIndex: 'promptResult',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_text, record) => {
        return (
          <div>
            <Link
              style={{ padding: '0px' }}
              onClick={() => {
                promptEditRef.current && promptEditRef.current.openModal(record, 'edit')
              }}
            >
              编辑
            </Link>
            <Divider type="vertical" />
            <Link
              style={{ padding: '0px' }}
              onClick={() => getChangeEnable(record)}
            >
              {record.enabled ? <span style={{ color: 'red' }}>停用</span> : '启用'}
            </Link>
            {/* <Divider type="vertical" />
            <Link
              style={{ padding: '0px' }}
              onClick={() => {
                promptSortRef.current && promptSortRef.current.openModal(record)
              }}
            >
              编排
            </Link> */}
          </div>
        );
      },
    },
  ]

  // 拖曳排序
  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setTableData((prev) => {
        const activeIndex = prev.findIndex((i) => i.id === active.id);
        const overIndex = prev.findIndex((i) => i.id === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
      const newData = JSON.parse(JSON.stringify(tableData));
      const activeIndex = newData.findIndex((i) => i.id === active?.id);
      const overIndex = newData.findIndex((i) => i.id === over?.id);
      const obj = {
        promptEngineerId: newData[activeIndex]?.promptEngineerId,
        promptIdDTO: { id: active?.id, sortNum: activeIndex },
        tPromptIdDTOA: overIndex === 0 ? null : { id: newData[overIndex]?.id, sortNum: overIndex },
        tPromptIdDTOB: overIndex === newData?.length - 1 ? null : { id: newData[overIndex + 1]?.id, sortNum: overIndex + 1 }
      }
    }
  };

  return (
    <div className='prompts_list_container'>
      <Spin spinning={loading}>
        <Form
          form={form}
          labelCol={{
            style: {
              width: '70px',
            },
          }}
          wrapperCol={{
            style: {
              width: 'calc(100% - 70px)',
            },
          }}
          onFinish={handleSearch}
          onReset={handleReset}
        >
          <Row gutter={8}>
            <Col span={8}>
              <Form.Item label="标题" name="promptName">
                <Input allowClear placeholder="请输入标题" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Prompts" name="promptContent">
                <Input allowClear placeholder="请输入Prompts" />
              </Form.Item>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Form.Item>
                <Button type='primary' htmlType='submit' style={{ marginRight: 8 }}>查询</Button>
                <Button htmlType='reset'>重置</Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className='display justify-content-sbt mb-xs'>
          <Button onClick={handleArrange}>prompt编排</Button>
          <Button icon={<FileExcelOutlined />} onClick={handleExport}>导出全部</Button>
        </div>
        <Table
          rowKey='id'
          bordered
          columns={columns}
          dataSource={tableData}
          pagination={
            total > PAGE_NUM
              ? {
                onChange(current, pageSize) {
                  setSearchParams({
                    ...searchParams,
                    pageNo: current,
                    pageSize
                  })
                },
                total,
                current: searchParams.pageNo,
                pageSize: searchParams.pageSize,
                showSizeChanger: true,
                showQuickJumper: true,
              }
              : false
          }
        />
        <PromptEdit promptEditRef={promptEditRef} reload={getTableList} />
        <FlowModal ref={promptSortRef} reload={getTableList} />
      </Spin>
    </div>
  );
};

export default PromptRight;
