import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./login.less";
import { getLogin } from "../../server/ArticleList";
import { useEffect, useState } from "react";
const Login = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginType, setLoginType] = useState("user");
  const onFinish = (values) => {
    setLoginLoading(true);
    getLogin(values).then((res) => {
      setLoginLoading(false);
      if (res.code === 0) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        navigate({ pathname: "/" });
      } else {
        messageApi.open({
          type: "error",
          content: res.msg,
        });
      }
    });
  };
  useEffect(() => {
    /*
     * 解释一下goto参数，参考以下例子：*/
    if (loginType === "dd") {
      var url = encodeURIComponent(process.env.REACT_APP_DDURL);
      var goto = encodeURIComponent(
        "https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=ding1ixvoi4mwjxpihjs&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=" +
          url
      );

      DDLogin({
        id: "ddlogin", //这里需要你在自己的页面定义一个HTML标签并设置id，例如<div id="login_container"></div>或<span id="login_container"></span>
        goto: goto, //请参考注释里的方式
        style: "border:none;background-color:#FFFFFF;",
        width: "auto",
        height: "300",
      });
      var handleMessage = function (event) {
        var origin = event.origin;
        if (origin === "https://login.dingtalk.com") {
          //判断是否来自ddLogin扫码事件。
          var loginTmpCode = event.data;
          //获取到loginTmpCode后就可以在这里构造跳转链接进行跳转了
          window.location.href =
            "https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=appid&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=REDIRECT_URI&loginTmpCode=" +
            loginTmpCode;
        }
      };
      if (typeof window.addEventListener != "undefined") {
        window.removeEventListener("message", handleMessage);
        window.addEventListener("message", handleMessage, false);
      }
    } else {
      window.removeEventListener("message", handleMessage);
    }
  }, [loginType]);
  useEffect(() => {
    return () => {
      // window.removeEventListener("message")
    };
  }, []);
  const onFinishFailed = (errorInfo) => {
  };
  return (
    <div id="login">
      {contextHolder}
      <div className="login-box">
        <div className="login-tab-title">
          <div
            className={[
              "login-type",
              loginType === "user" && "acv-login-type",
            ].join(" ")}
            onClick={() => setLoginType("user")}
          >
            密码登录
          </div>
          <div
            className={[
              "login-type",
              loginType === "dd" && "acv-login-type",
            ].join(" ")}
            onClick={() => setLoginType("dd")}
          >
            钉钉登录
          </div>
        </div>
        {loginType === "user" && (
          <div className="form-box">
            <Form
              name="basic"
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="账号"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "请输入正确用户名!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "请输入正确密码!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="remember"
                valuePropName="checked"
                wrapperCol={{
                  offset: 0,
                  span: 16,
                }}
              >
                <Checkbox>记住我</Checkbox>
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  offset: 7,
                  span: 16,
                }}
              >
                <Button
                  loading={loginLoading}
                  style={{ width: "120px", height: "35px" }}
                  type="primary"
                  htmlType="submit"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
        {loginType === "dd" && <div id="ddlogin"></div>}
      </div>
    </div>
  );
};

export default Login;
