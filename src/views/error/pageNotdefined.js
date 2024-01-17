import {Button, Result} from "antd";
import {useNavigate} from "react-router-dom";

const PageNotdefined = () => {
    const navigate = useNavigate();
    return <Result
        style={{height: '100%'}}
        status="404"
        title="404"
        subTitle="没找到页面"
        extra={<Button type="primary" onClick={() => navigate({pathname: '/'})}>回到首页</Button>}
    />
};
export default PageNotdefined