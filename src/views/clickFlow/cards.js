import { message, Modal } from "antd";
import { useNavigate } from "react-router";
import { delPrompt } from "../../server/clickFlow";
import "./cards.less";

export default function ChakraCards({
  cards,
  onload,
  setPagination,
  pagination,
  showModal,
}) {
  const history = useNavigate();

  const delPromptModal = (id, title) => {
    Modal.confirm({
      title: "提示",
      content: `您确定要删除${title}吗?`,
      onOk: async () => {
        try {
          await delPrompt(id);
          message.success("删除成功");
          setPagination({ ...pagination, current: 1 });
          onload && onload();
        } catch (e) {}
      },
    });
  };

  return cards.map(({ title, id }, index) => (
    <div className="flow-card" key={index}>
      <i
        className="iconfont icon-lunwenzhenghe-bianji"
        onClick={() => showModal("修改", { id, title })}
      ></i>
      <i
        className="iconfont icon-jiangzhong-shanchu"
        onClick={() => delPromptModal(id, title)}
      ></i>
      <div className="card-title">
        <div className="card-mainTitle" title={title}>
          {title}
        </div>
      </div>
      <div
        className="card-jump-btn"
        onClick={() =>
          history("/click-flow/workflow", { state: { title, id } })
        }
      >
        详细展开
      </div>
    </div>
  ));
}
