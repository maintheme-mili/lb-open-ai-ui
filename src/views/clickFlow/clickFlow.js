import { useState } from "react";
import ChakraCards from "./cards";
import { add_prompt, useFlowList } from "./clickFlowService";
import { Button, Input, message, Modal, Pagination, Spin, Empty } from "antd";
import { flowUpdate } from "@/server/clickFlow";
import "./clickFlow.less";

export default function ClickFlow() {
  const [prompt, setPrompt] = useState({ id: "", title: "" });
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [title, setTitle] = useState("添加");
  const [id, setId] = useState("");

  const [loading, list, total, pagination, getFlowList, setPagination] =
    useFlowList();

  const showModal = (titleIn, promptIn) => {
    if (titleIn === "修改") setPrompt(promptIn);
    setTitle(titleIn || "添加");
    setOpen(true);
  };
  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      title === "添加" && (await add_prompt(prompt));
      title === "修改" && (await flowUpdate(prompt));
      message.success(`${title}成功`);
      setOpen(false);
      setPrompt({ ...prompt, title: "", id: "" });
      await getFlowList();
    } catch (e) {}
    setConfirmLoading(false);
  };
  const handleCancel = () => {
    setOpen(false);
    setPrompt({ ...prompt, title: "", id: "" });
  };

  return (
    <div id="click-flow">
      <div id="flow-title">
        <i className="iconfont icon-xinxi2"></i>
        <span>创建新的 逐步运行</span>
        <Button type="default" id="title-add-btn" onClick={() => showModal()}>
          添加
        </Button>
      </div>
      <div id="flow-cards">
        <Spin id="cards-loading" spinning={loading} />
        <ChakraCards
          showModal={showModal}
          cards={list}
          onload={async () => await getFlowList()}
          setPagination={setPagination}
          pagination={pagination}
        />
      </div>
      {total === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: "100px" }}
        />
      )}
      <Pagination
        className="flow-pagination"
        pageSize={pagination.pageSize}
        current={pagination.current}
        total={pagination.total}
        onChange={(current, pageSize) => {
          setPagination({ ...pagination, current, pageSize });
        }}
      />

      <Modal
        title={title}
        className="flow-add-modal"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        标题：
        <Input
          value={prompt.title}
          maxLength={100}
          onChange={(e) => setPrompt({ ...prompt, title: e.target.value })}
        />
      </Modal>
    </div>
  );
}
