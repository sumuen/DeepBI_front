export const dialogueStorage = () => {
    const getCurrentTimestamp = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const defaultDialogue = [{
        "table_name": {
            "tableName": [
                { "name": "order_details.csv" },
                { "name": "order_list.csv" },
                { "name": "sales_target.csv" }
            ]
        },
        "Charttable_id": 0,
        "label": "csv数据源",
        "id": 0,
        "type": "csv",
        "title": "新对话1",
        "uuid": Date.now(),
        "messages": [{
            "content": "这是一个示例数据源，请在下方输入文字进行聊天，用户选择的数据包含三个表格：'order_details.csv'，包含订单详情；'order_list.csv'，包括订单列表；以及'sales_target.csv'，包含销售目标。",
            "sender": "bot",
            "Cardloading": false,
            "time": getCurrentTimestamp()
        }]
    }];

    const addAutopilotStorage = (dialogue) => {
        sessionStorage.setItem("Chart_Dialogue_Autopilot", JSON.stringify(dialogue));
    };

    const getAutopilotStorage = () => {
        return JSON.parse(sessionStorage.getItem("Chart_Dialogue_Autopilot"));
    };

    const addDialogueStorage = (dialogue) => {
        sessionStorage.setItem("Chart_Dialogue", JSON.stringify(dialogue));
    };

    const getDialogueStorage = () => {
        return JSON.parse(sessionStorage.getItem("Chart_Dialogue"));
    };

    const addChatList = (dialogue, type) => {
        if (dialogue.length <= 0) {
            sessionStorage.setItem("Chart_Dialogue", JSON.stringify(defaultDialogue));
            document.dispatchEvent(new CustomEvent('dialogueUpdated', { detail: defaultDialogue }));
            return;
        }
        let Chart_Dialogue = [];
        if (type === "chat") {
            Chart_Dialogue = getDialogueStorage();
        } else {
            Chart_Dialogue = getDashboard();
        }
        if (Chart_Dialogue && Chart_Dialogue.length > 0) {
            Chart_Dialogue[Chart_Dialogue.length - 1].messages = dialogue;
        }
        type === "chat" ? addDialogueStorage(Chart_Dialogue) : addDashboard(Chart_Dialogue);
        if (type === "chat" && Chart_Dialogue && Chart_Dialogue.length > 0 && Chart_Dialogue[Chart_Dialogue.length - 1].messages.length >= 2) {
            addAllStorage(Chart_Dialogue);
        }
    };

    const addDashboard = (dialogue) => {
        sessionStorage.setItem("Chart_Dashboard", JSON.stringify(dialogue));
    };

    const setDialogueStorageDashboardId = (id) => {
        let dialogueStorage = getDashboard();
        if (dialogueStorage && dialogueStorage.length > 0) {
            dialogueStorage[0].dashboardId = id;
        }
        addDashboard(dialogueStorage);
    };

    const getDashboard = () => {
        return JSON.parse(sessionStorage.getItem("Chart_Dashboard"));
    };

    const addAllStorage = (dialogue) => {
        let allStorage = getAllStorage();
        if (allStorage.length >= 10) {
            allStorage.splice(0, 1);
        }
        let index = allStorage.findIndex((item) => {
            return item.uuid === dialogue[0].uuid;
        });
        if (index >= 0) {
            allStorage[index].messages = dialogue[0].messages;
        } else {
            allStorage.push(dialogue[0]);
        }
        localStorage.setItem("Chart_All", JSON.stringify(allStorage));
    };

    const getAllStorage = () => {
        return JSON.parse(localStorage.getItem("Chart_All")) || [];
    };

    return {
        getAutopilotStorage,
        addAutopilotStorage,
        addDashboard,
        getDashboard,
        addDialogueStorage,
        getDialogueStorage,
        addChatList,
        getAllStorage,
        setDialogueStorageDashboardId
    };
};
