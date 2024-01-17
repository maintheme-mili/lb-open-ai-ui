import React, { useImperativeHandle, useState, forwardRef } from 'react';
import { Modal, Tree } from 'antd';
import { getParentTreeList } from "@/server/messageaapiList";
import { visitTree } from '@/utils/tree';
import './index.less';

const FlowModal = (porps, ref) => {
  const [visible, setVisible] = useState(false);
  const [expandedKeys] = useState([]);
  const [treeData, setTreeData] = useState([]);

  useImperativeHandle(ref, () => ({
    openModal: (record) => {
      setVisible(true);
      queryParentPromptList(record?.promptEngineerId);
    }
  }));

  const queryParentPromptList = (promptEngineerId) => {
    getParentTreeList({ promptEngineerId }).then(res => {
      if (res.code === 0) {
        const treeArray = [...res.data];
        visitTree(treeArray, (item) => {
          item.key = item.id;
          item.title = item.promptName;
          item.value = item.id;
        });
        setTreeData(treeArray || [])
      }
    })
  }

  const handleSubmit = () => {
    setVisible(false);
  }

  const handleCancel = () => {
    setVisible(false);
  }

  const onDrop = info => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    };
    const data = [...treeData];
    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else if (
      ((info.node).props.children || []).length > 0 && // Has children
      (info.node).props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else {
      let ar = [];
      let i;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }
    setTreeData(data);
  };

  return (
    <Modal
      style={{ top: 20 }}
      title="插入流程"
      open={visible}
      maskClosable={false}
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <Tree
        className="draggable-tree"
        draggable
        blockNode
        selectable={false}
        defaultExpandedKeys={expandedKeys}
        treeData={treeData}
        onDrop={onDrop}
      />
    </Modal>
  )
}

export default forwardRef(FlowModal);
