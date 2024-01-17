import ReactFlow, {Controls, Background, Handle} from "react-flow-renderer";
import './index.less'

const WorkFlow = () => {
    return <ReactFlow
        id='work_flow_container'
    >
        <Controls fitViewOptions={{maxZoom: 1}}/>
        <Background color="#aaa" gap={16}/>
    </ReactFlow>
}

export default WorkFlow;