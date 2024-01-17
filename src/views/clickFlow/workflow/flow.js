import {useMemo} from "react";
import ReactFlow, {Controls, Background, Handle} from "react-flow-renderer";
import _ from 'lodash-es';
import "./flow.less";

/**
 * 流程图
 * @param {{prompts: { id, promptName, enabled }[]}} props
 * @returns
 */
export default function Flow({prompts}) {
    const getChildren = (id) =>
        prompts.filter((item) => item.parentId === id && item.id !== undefined);

    // 梳理流程节点层级关系，计算出每个节点的X/Y坐标
    const hierarchyPrompts = useMemo(() => {
        let hierarchyArr = prompts[0]
            ? [{...prompts[0], xLevel: 1, yLevel: 1}]
            : [];
        const getHierarchyArr = (promptsIn) => {
            promptsIn.forEach((prompt) => {
                const x = 100 * prompt.xLevel + (prompt.xLevel - 1) * 100;
                const y = prompt.yLevel * 100;
                prompt.position = {x, y};
                let children = getChildren(prompt.id).map((child) => ({
                    ...child,
                    xLevel: prompt.xLevel + 1,
                }));
                children = children.map((child, index) => ({
                    ...child,
                    yLevel:
                        children.length === 1
                            ? prompt.yLevel
                            : index === 0
                                ? prompt.yLevel - children.length / 3
                                : prompt.yLevel - children.length / 3 + index,

                }));
                hierarchyArr.push(...children);
                !!children.length && getHierarchyArr(children);
            });
        };
        !!prompts.length && getHierarchyArr(hierarchyArr);
        return hierarchyArr;
    }, [prompts]);

    // 创建流程图节点
    const nodes = useMemo(() => {
            const _hierarchyPrompts = _.cloneDeep(hierarchyPrompts)
            let isOverlap = true;
            while (isOverlap) {
                let find = false;
                let findIndex = null
                for (let i = 0; i < _hierarchyPrompts.length; i++) {
                    const item = _hierarchyPrompts[i];
                    const findOverlap = _hierarchyPrompts.find((findItem, index) => {
                        if (index === i) return false;
                        if ((Math.floor(item.position.y) === Math.floor(findItem.position.y) && Math.floor(item.position.x) === Math.floor(findItem.position.x))) {
                            findIndex = index;
                            return true;
                        }
                    })
                    if (findOverlap) {
                        find = true
                        if (_hierarchyPrompts[findIndex].position.y >= 0) {
                            _hierarchyPrompts[findIndex].position.y += 100
                        } else {
                            _hierarchyPrompts[findIndex].position.y -= 100
                        }
                        break;
                    }
                }
                if (!find) {
                    break
                }
            }
            return _hierarchyPrompts.map(({id, promptName, position, enabled}, index) => ({
                type: "custom",
                id,
                position,
                data: {
                    label: promptName,
                    type: index === 0 ? "prompt" : "normal",
                    enabled,
                },
                sourcePosition: "right",
                targetPosition: "left",
                className: "flow-node",
            }))
        },
        [hierarchyPrompts]
    );

    // 创建节点连接关系
    const edges = useMemo(() => {
        let edgesData = [];
        let edgeArr = [];
        for (let i = 0; i < prompts.length; i++) {
            edgeArr = [];
            const {id} = prompts[i];

            const children = getChildren(id);
            if (!children) {
                edgeArr.push({
                    source: id,
                    id: id,
                });
            }
            children.forEach((item) => {
                edgeArr.push({
                    source: id,
                    target: item.id,
                    id: `${id}${item.id}`,
                });
            });
            edgesData.push(...edgeArr);
        }
        return edgesData;
    }, [prompts]);

    // 自定义节点
    function CustomNode({data, sourcePosition, targetPosition}) {
        return (
            <div className={["custom-node", data.type, data.enabled].join(" ")}>
                <Handle type="source" position={sourcePosition}/>
                {data.type === "prompt" && (
                    <div className="custom-node-header">Prompt</div>
                )}
                <div className="custom-node-body">{data.label}</div>
                <Handle type="target" position={targetPosition}/>
            </div>
        );
    }

    // 自定义节点类型
    const nodeTypes = {
        custom: CustomNode,
    };

    return (
        <ReactFlow
            id="flow-container"
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView={true}
            fitViewOptions={{maxZoom: 1}}
        >
            <Controls fitViewOptions={{maxZoom: 1}}/>
            <Background color="#aaa" gap={16}/>
        </ReactFlow>
    );
}
