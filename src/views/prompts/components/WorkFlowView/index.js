import {Modal} from "antd";
import {useImperativeHandle, useState} from "react";

const WorkFlowView = (props) => {
    const {workFlowViewRef} = props;
    const [visible, setVisible] = useState(false);

    useImperativeHandle(workFlowViewRef, () => ({
        openModal: (flowData) => {
            setVisible(true);
        }
    }))
    return <Modal
        title='prompt工作流预览'
        open={visible}
    >

    </Modal>
}

export default WorkFlowView