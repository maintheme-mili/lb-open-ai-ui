import {Layout, Breadcrumb, Divider, Space, Dropdown, message, Avatar} from 'antd';
import React, {useEffect, useState} from 'react';
import PromptRight from './components/table/index.js';
import MueList from './components/mueList/index';
import {DownOutlined, HomeOutlined, RollbackOutlined, UnorderedListOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {outLogin} from "@/server/ArticleList";
import './index.less';

const {Header, Sider, Content} = Layout;

const PromptList = () => {
    const [selectId, setSelectId] = useState('');
    const navigate = useNavigate(); //跳转
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        setTimeout(() => {
            if (!localStorage.getItem("token")) {
                localStorage.clear();
                navigate({
                    pathname: "/login",
                    state: {pathname: window.location.pathname},
                });
            } else {
                const info = localStorage.getItem('userInfo');
                if (info) {
                    setUserInfo(JSON.parse(info))
                }
            }
        })
    }, [navigate]);

    const isOutLogin = () => {
        outLogin().then((res) => {
            if (res.code === 0) {
                localStorage.clear();
                navigate({
                    pathname: "/login",
                    state: {pathname: window.location.pathname},
                });
            } else {
                message.error(res.msg);
            }
        });
    };

    const dropdownItem = [
        {
            key: '1',
            label: (
                <a onClick={isOutLogin}>
                    退出登录
                </a>
            ),
        }
    ]

    return (
        <Layout className='main_layout'>
            <Header
                className="main_header"
                style={{
                    paddingLeft: 20,
                }}
            >
                <RollbackOutlined title='回到首页' style={{color: '#fff', verticalAlign: 'middle'}}
                                  onClick={() => navigate({pathname: '/'})}/>
                <Divider type="vertical"/>
                <Breadcrumb
                    className='main_breadcrumb'
                    items={[
                        {
                            onClick: () => navigate({pathname: '/'}),
                            title: <HomeOutlined title='首页' style={{cursor: "pointer"}}/>,
                        },
                        {
                            title: (
                                <>
                                    <UnorderedListOutlined/>
                                    <span>Prompt</span>
                                </>
                            ),
                        }
                    ]}
                />
                <div className="user_info">
                    <Dropdown menu={{items: dropdownItem}}>
                        <span onClick={(e) => e.preventDefault()} style={{cursor: 'pointer'}}>
                            <Space>
                                <Avatar src={userInfo.avatar}/>
                                {userInfo.realName}
                                <DownOutlined/>
                            </Space>
                        </span>
                    </Dropdown>
                </div>
            </Header>
            <Layout className='main_container'>
                <Sider className='main_sider' width={240} theme='light'>
                    <MueList handleKey={(id) => setSelectId(id)}></MueList>
                </Sider>
                <Content className='main_content_wrapper'>
                    <div className='main_content'>
                        <PromptRight id={selectId}/>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};
export default PromptList;