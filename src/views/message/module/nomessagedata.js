/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-03-10 11:43:38
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-16 17:58:27
 */
import { ArrowRightOutlined } from "@ant-design/icons";
const NomessageData = (props) => {
  const data = [
    {
      name: "例子",
      children: [
        { icon: <ArrowRightOutlined />, text: '"对10岁生日有什么创意吗"',click:(e)=>setValue(e) },
        { icon: <ArrowRightOutlined />, text: '"如何在 Javascript 中发出 HTTP 请求？"',click:(e)=>setValue(e) },
        { icon: <ArrowRightOutlined />, text: '"《用简单的术语解释量子计算》"',click:(e)=>setValue(e) },
      ],
    },
    {
      name: "能力",
      children: [
        { icon: null, text: "记住用户早些时候在对话中说的话" },
        { icon: null, text: "允许用户提供后续更正" },
        { icon: null, text: "接受过拒绝不当请求的培训" },
      ],
    },
    {
      name: "限制",
      children: [
        { icon: null, text: "可能偶尔会产生不正确的信息" },
        { icon: null, text: "可能偶尔会产生有害的指令或有偏见的内容" },
        { icon: null, text: "对 2021 年后的世界和事件的了解有限" },
      ],
    },
  ];
  const setValue=(e)=>{
  props.getDemotext(e)
  }
  return <div className="nomessage">
      {data.map((item,index)=>{
          return <div className="no-item" key={index}><h1
          >{item.name}</h1>
          {item.children.map((items,i)=>{
              return <div className="no-items" key={i} onClick={()=>{items.click&&items.click(items)}}>
                 <p style={{cursor:items.icon?"pointer":''}}>{items.text}{items.icon}</p> </div>
          })}
          </div>
      })}
  </div>;
};
export default NomessageData;
