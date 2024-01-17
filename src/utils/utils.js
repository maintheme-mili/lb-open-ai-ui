import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * 获取url的query数据
 * @param {string[]} keys
 * @returns
 */
export const useUrlQueryParam = (keys) => {
  const [searchParam, setSearchParam] = useSearchParams();

  return [
    useMemo(
      () =>
        keys.reduce((pre, key) => {
          return { ...pre, [key]: searchParam.get(key) || "" };
        }, {}),
      [searchParam, keys]
    ),
    (param) => {
      const o = cleanObj({
        ...Object.fromEntries(searchParam),
        ...param,
      });
      return setSearchParam(o);
    },
  ];
};

const isFalsy = (value) => {
  return value === 0 ? false : !value;
};

const cleanObj = (obj) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (isFalsy(value)) {
      delete obj[key];
    }
  });
  return obj;
};

/**
 * 延迟执行
 * @param {any} value
 * @param {number} delay
 * @returns
 */
export const useDebounce = (value, delay) => {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounceValue;
};

// 防抖函数
export const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
};

export const extractTextFromHTML = (htmlString) => {
  var regex = /<[^>]*>/g; // 匹配所有HTML标签
  var text = htmlString.replace(regex, ""); // 将所有标签替换为空字符串
  return text;
};

/**
 * 判断是否json字符串
 * @param {string} str
 * @returns
 */
export const getJSONForStr = (str) => {
  try {
    return JSON.parse(str.replace(/'/g, '"'));
  } catch (e) {
    return str;
  }
};
