import { clearConfigCache } from "prettier";

class Spec {
  constructor() {
    // this. ...
  }
}

class Suggestion {
  constructor(relation, spec, description) {
    this.relation = relation;
    this.spec = spec;
    this.description = description;
    this.rowNum = 0;
    this.colNum = 0;
    this.children = [];
  }

  computeMetaData() {
    if (this.spec) {
      // this.rowNum = ...;
      // this.colNum = ...;
    }
  }
}

// 生成推荐列表
// 交互过程中，partialSpec 会进行剪枝
const generateSuggestions = (relation, partialSpec) => {
  const suggestions = [];
  const entities = relation.entities;
  const entityNum = entities.length;
  const indexes = new Array(entityNum).fill(0).map((_, index) => index);

  for (let currEntityNum = 1; currEntityNum < entityNum; currEntityNum++) {
    const combinations = computeCombination(indexes, currEntityNum);
    const description =
      currEntityNum === 1 ? "1 entity" : `${currEntityNum} entities`;
    const suggestion = new Suggestion(relation, "", description);
    for (const combination of combinations) {
      const combinationEntityNames = entities
        .filter((_, index) => combination.includes(index))
        .map((entity) => entity.name);
      const otherEntityNames = entities
        .filter((_, index) => !combination.includes(index))
        .map((entity) => entity.name);

      const rowHeadingSpec = linkEntityNamesByOperator(
        combinationEntityNames,
        "×"
      );
      const bodySpec = linkEntityNamesByOperator(otherEntityNames, "+");
      const spec = `(${rowHeadingSpec}), () -> (${bodySpec})`;
      suggestion.children.push(
        new Suggestion(
          relation,
          spec,
          linkEntityNamesByOperator(combinationEntityNames, "×")
        )
      );
    }
    suggestions.push(suggestion);
  }
  return suggestions;
};

// 生成排列组合
const computeCombination = (indexes, num) => {
  if (num === 1) {
    return indexes.map((index) => [index]);
  } else {
    const totalCombination = [];
    for (const selectedIndex of indexes) {
      // 组合的核心步骤，要求排好序
      const toCombineIndexes = indexes.filter((index) => index > selectedIndex);
      const combinations = computeCombination(toCombineIndexes, num - 1);
      combinations.forEach((combination) => {
        combination.push(selectedIndex);
      });
      totalCombination.push(...combinations);
    }
    return totalCombination;
  }
};

// 连接实体名字符串
const linkEntityNamesByOperator = (entityNames, operator) => {
  return entityNames.reduce((total, currValue, currIndex) => {
    if (currIndex === 0) return `${currValue}`;
    else return `${total} ${operator} ${currValue}`;
  });
};

// 生成随机颜色
const genRandomColor = (length) => {
  if (length == 0) {
    return [];
  }
  var r = Math.floor(Math.random() * 256); //随机生成256以内r值
  var g = Math.floor(Math.random() * 256); //随机生成256以内g值
  var b = Math.floor(Math.random() * 256); //随机生成256以内b值
  var a = Math.random();
  if (length == 1) {
    return [`rgb(${r},${g},${b},${a})`];
  }
  const baseAlpha = 0.1; //基准透明度
  var res = [];
  for (var i = 0; i < length; i++) {
    let alpha = baseAlpha + (1.0 - baseAlpha) / length * (1 + i);
    res.push(`rgb(${r},${g},${b},${alpha})`);
  }
  return res;
}

// 数组去重
const unique = (a) => {
  return Array.from(new Set(a));
}

// 判断spec是否合法
const checkValidSpec = (spec) => {
  if (!("row_header" in spec) && !("column_header" in spec)) {
    return false;
  }
  if (!("body" in spec)) {
    return false;
  }
  return true;
}

// 字符串化spec
const calString = (spec) => {
  if (!spec) return "";
  if (spec.operator === "attr") {
    return `${spec.data}.${spec.attribute}`;
  } else {
    let res = [];
    spec.parameters.forEach(item => {
      res.push(calString(item));
    })
    let tmp = spec.operator + "(";
    for (let i = 0; i < res.length; i++) {
      if (i == 0) {
        tmp = tmp + res[i];
      } else {
        tmp = tmp + ", " + res[i];
      }
    }
    tmp = tmp + ")";
    return tmp;
  }
}

const stringfySpec = (spec) => {
  let row = calString(spec["row_header"]);
  let column = calString(spec["column_header"]);
  let body = calString(spec["body"]);
  return `(${row}), (${column}) => (${body})`;
}

export default { generateSuggestions, genRandomColor, unique, checkValidSpec, stringfySpec };
