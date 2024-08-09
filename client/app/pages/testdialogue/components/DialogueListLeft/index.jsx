import React, { useState, useEffect } from "react";
import "./index.css";
import MessageOutlinedIcon from "@ant-design/icons/MessageOutlined";
import MenuFoldOutlined from "@ant-design/icons/MenuFoldOutlined";
import MenuUnfoldOutlined from "@ant-design/icons/MenuUnfoldOutlined";

const DialogueLeftList = props => {
  const [arr, setArr] = useState([]);
  const [uuid, setUuid] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setArr(JSON.parse(localStorage.getItem("Chart_All")) || []);
  }, []);

  const modeSwitch = item => () => {
    setUuid(item.uuid);
    props.switchMode(item);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const DiaBottom = () => {
    return (
      <div className="dia-content">
        {arr.map((item, index) => (
          <div className="flex-d dia-info" key={index}>
            <div className="dia-chats">
              <div className="dia-chat" onClick={modeSwitch(item)}>
                <div className="icon-container">
                  <MessageOutlinedIcon style={{ color: uuid === item.uuid ? "#4974d1" : "#fff", fontSize: "21px" }} />
                </div>{" "}
                <div className="dia-chat-name">{item.messages[1].content || item.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {arr && arr.length > 0 && (
        <div className={`dia-main ${collapsed ? "collapsed" : ""}`}>
          <DiaBottom />
          <div className="toggle-button" onClick={toggleSidebar}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </div>
      )}
    </>
  );
};

export default DialogueLeftList;
