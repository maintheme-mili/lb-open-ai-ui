import {useEffect, useState} from "react";
import {
    arrangeEnable,
    historyList,
    promptDetail,
    relationParents,
    savePrompt,
} from "../../../server/clickFlow";

/**
 * 获取prompt详情
 */
export const usePromptDetail = (engineerId) => {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getPromptDetail = async (toTop = true, addAllEmpty = true) => {
        toTop && setLoading(true);
        try {
            const res = await promptDetail(engineerId);
            const emptPrompts = prompts.filter((item) => item.id === undefined);
            !addAllEmpty && emptPrompts.pop();
            setPrompts([...res.data.prompts, ...emptPrompts]);
            if (toTop) {
                let timer = setTimeout(() => {
                    window.scrollTo(0, 0);
                    clearTimeout(timer);
                });
            }
        } catch (e) {
        }
        toTop && setLoading(false);
    };
    return [loading, prompts, setPrompts, getPromptDetail];
};

/**
 * 编排记录
 */
export const usePrompt = (data) => {
    const [loading, prompts, setPrompts, getPromptDetail] = usePromptDetail(
        data.engineerId
    );
    const [parents, setParents] = useState([]);

    const getParents = async () => {
        try {
            const res = await relationParents(data.engineerId);
            if (res.code === 0) {
                setParents(res.data);
            }
        } catch (e) {
        }
        return parents;
    };

    const asyncSavePrompt = async (dataIn, changeEnable) => {
        try {
            changeEnable && (await arrangeEnable(dataIn));
            !changeEnable && (await savePrompt(dataIn));
            await getParents();
            await getPromptDetail(false, dataIn.id !== undefined);
        } catch (e) {
            throw Error(e);
        }
    };

    useEffect(() => {
        getParents();
        getPromptDetail();
    }, []);

    return [loading, asyncSavePrompt, prompts, parents, setPrompts];
};

/**
 * 获取编排记录
 * @param {*} data
 * @returns
 */
export const useHistory = (data, response, content, historyRef) => {
    const [histories, setHistories] = useState([]);

    const asyncHistory = async () => {
        try {
            const res = await historyList(data);
            setHistories(res.data || []);
            let timer = setTimeout(() => {
                historyRef.current?.scrollTo(0, historyRef.current?.scrollHeight);
                clearTimeout(timer);
            });
        } catch (e) {
        }
    };

    useEffect(() => {
        data.id && asyncHistory();
    }, []);

    useEffect(() => {
        if (response) {
            histories[histories.length - 1] = {prompt: content, response};
            setHistories([...histories]);
        }
    }, [response]);
    return [histories, setHistories, asyncHistory];
};

/**
 * 获取用户头像
 * @returns
 */
export const useAvatar = () => {
    const [avatar, setAvatar] = useState("");
    useEffect(() => {
        if (localStorage.getItem("userInfo")) {
            setAvatar(JSON.parse(localStorage.getItem("userInfo")).avatar);
        }
    }, []);
    return avatar;
};
