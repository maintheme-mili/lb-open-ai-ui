const treeToList = (treeDatas) => {
  const results = [];
  _treeToList(treeDatas, results);
  return results;
};

const _treeToList = (treeDatas, listDatas) => {
  if (treeDatas && treeDatas.length > 0) {
    treeDatas.forEach((treeData) => {
      listDatas.push(treeData);
      if (treeData.children && treeData.children.length > 0) {
        _treeToList(treeData.children, listDatas);
      }
    });
  }
};

const visitTree = (treeDatas, callback) => {
  if (treeDatas && treeDatas.length > 0) {
    treeDatas.forEach((treeData) => {
      callback(treeData);
      if (treeData.children && treeData.children.length > 0) {
        visitTree(treeData.children, callback);
      }
    });
  }
};

export { treeToList, visitTree };
