import { useEffect, useState } from "react";
import { addPrompt, flowList } from "../../server/clickFlow";

/**
 * 获取项目列表
 */
export const useFlowList = (paginationIn) => {
  const [pagination, setPagination] = useState(
    paginationIn || {
      current: 1,
      pageSize: 12,
      total: 0,
    }
  );
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);

  const getFlowList = async () => {
    setList([]);
    setLoading(true);
    try {
      const res = await flowList({
        page: pagination.current,
        size: pagination.pageSize,
      });
      setList(res.data.records);
      setTotal(res.data.total);
      setPagination({ ...pagination, total });
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    getFlowList();
  }, [pagination.current, pagination.pageSize]);

  return [loading, list, total, pagination, getFlowList, setPagination];
};

/**
 * 添加项目
 */
export const add_prompt = async (data) => await addPrompt(data, "flow");
