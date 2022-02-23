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
  // if (!("body" in spec)) {
  //   return false;
  // }
  return true;
}

// 字符串化spec
const calString = (spec) => {
  if (!spec) return "";
  if (spec.value) {
    return String(spec.value);
  } else if (spec.operator === "attr") {
    return `${spec.data}.${spec.attribute}`;
  } else {
    let res = [];
    spec.parameters.forEach(item => {
      res.push(calString(item));
    })
    if (spec.operator == "cross" || spec.operator == "add") {
      let tmp = res[0];
      for (let i = 1; i < res.length; i++) {
        tmp += ` × ${res[i]}`;
      }
      return tmp;
    } else {
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
}

const stringfySpec = (spec) => {
  // console.log(spec);
  let row = calString(spec["row_header"]);
  let column = calString(spec["column_header"]);
  let body = calString(spec["body"]);
  return `(${row}), (${column}) => (${body})`;
}

//判断attribute是否为categorical
const isCategorical = (valueList) => {
  for (let i = 0; i < valueList.length; i++) {
    if (typeof (valueList[i]) != "number") {
      return true;
    }
  }
  return false;
}

//将row_header等spec object转为数组形式
const specObj2List = (specObj) => {
  if (!specObj) return [];
  if (specObj.operator == "cross" || specObj.operator == "add") {
    return specObj2List(specObj.parameters[0]).concat(specObj2List(specObj.parameters[1]));
  } else {
    return [specObj];
  }
}

//修正strName（临时功能，后面再优化吧）
const refineStrName = (obj) => {
  return obj.strName ? obj.strName : obj;
}

//给定spec，生成alternative suggestion
const genAlterSpec = (row_header, column_header, body) => {
  let specList = [];
  let rowlen = row_header.length,
    collen = column_header.length;
  let num_attr = rowlen + collen;
  if (num_attr > 5) {
    throw new Error(
      "Too many attributes in header, alternative generation disabled"
    );
  } else {
    let cur = (1 << num_attr) - (1 << rowlen);
    let tmprow = [],
      tmpcol = [];
    for (let i = 0; i < 1 << num_attr; i++) {
      if (i == cur) continue;
      (tmprow = []), (tmpcol = []);
      for (let j = 0; j < num_attr; j++) {
        let item =
          j < rowlen ? row_header[j] : column_header[j - rowlen];
        if ((i >> j) & 1) {
          tmpcol.push(item);
        } else {
          tmprow.push(item);
        }
      }
      let spec = genSpec(tmprow, tmpcol, body);
      spec["description"] = stringfySpec(spec);
      specList.push(spec);
    }
  }
  return specList;
  // this.storeAlterSpecList(specList);
}

const genSpec = (row_header, column_header, body) => {
  // console.log(row_header, column_header);
  let spec = {};
  if (row_header.length == 1) {
    spec["row_header"] = refineStrName(row_header[0]);
  } else if (row_header.length > 1) {
    spec["row_header"] = refineStrName(
      row_header[row_header.length - 1]
    );
    for (let i = row_header.length - 2; i >= 0; i--) {
      spec["row_header"] = {
        operator: "cross",
        parameters: [
          refineStrName(row_header[i]),
          spec["row_header"],
        ],
      };
    }
  }
  if (column_header.length == 1) {
    spec["column_header"] = refineStrName(column_header[0]);
  } else if (column_header.length > 1) {
    spec["column_header"] = refineStrName(
      column_header[column_header.length - 1]
    );
    for (let i = column_header.length - 2; i >= 0; i--) {
      spec["column_header"] = {
        operator: "cross",
        parameters: [
          refineStrName(column_header[i]),
          spec["column_header"],
        ],
      };
    }
  }
  if (body.length == 1) {
    spec["body"] = refineStrName(body[0]);
  } else if (body.length > 1) {
    spec["body"] = refineStrName(body[body.length - 1]);
    for (let i = body.length - 2; i >= 0; i--) {
      spec["body"] = {
        operator: "add",
        parameters: [refineStrName(body[i]), spec["body"]],
      };
    }
  }
  return spec;
}

const genExploreSpec = (row_header, column_header, body, attrInfo) => {
  let specListWithAdd = [];
  let unusedSpec = [];
  if(attrInfo) {
    attrInfo.forEach((item) => {
      unusedSpec.push(item);
    });
  }
  deleteUsedSpec(unusedSpec, row_header);
  deleteUsedSpec(unusedSpec, column_header);
  deleteUsedSpec(unusedSpec, body);
  if(!unusedSpec) {
    return specListWithAdd;
  }
  unusedSpec.forEach((item) => {
    let specList = [];
    let tmprow = [],
      tmpcol = [],
      tmpbody = [];
    if(row_header) {
      row_header.forEach((t) => {
        tmprow.push(t);
      });
    }
    if(column_header) {
      column_header.forEach((t) => {
        tmpcol.push(t);
      });
    }
    if(body) {
      body.forEach((t) => {
        tmpbody.push(t);
      });
    }
    tmprow.push(item);
    let spec = genSpec(tmprow, tmpcol, tmpbody);
    spec["description"] = stringfySpec(spec);
    specList.push(spec);
    tmprow.splice(tmprow.length - 1, 1);
    tmpbody.push(item);
    let spec2 = genSpec(tmprow, tmpcol, tmpbody);
    spec2["description"] = stringfySpec(spec2);
    specList.push(spec2);
    let item_str = calString(refineStrName(item));
    specListWithAdd.push({
      "add": item_str,
      "list": specList
    });
  });
  // console.log(specListWithAdd);
  return specListWithAdd;
  // this.storeSuggestion(specListWithAdd);
}

const deleteUsedSpec = (unusedSpec, header) => {
  if(!header) return;
  header.forEach((item) => {
    if (refineStrName(item).operator == "attr") {
      for (let j = 0; j < unusedSpec.length; j++) {
        let spec = unusedSpec[j];
        if (
          refineStrName(item).data == spec.data &&
          refineStrName(item).attribute == spec.attribute
        ) {
          unusedSpec.splice(j, 1);
          break;
        }
      }
    }
  });
}

export default {
  generateSuggestions, genRandomColor, unique, checkValidSpec, stringfySpec, isCategorical, specObj2List, refineStrName, calString,
  genAlterSpec, genSpec, genExploreSpec, deleteUsedSpec
};
