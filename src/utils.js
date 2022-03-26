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

const hsl2rgb = (h, s, l) => {
  var r, g, b;
  if(s == 0){
    r = g = b = l; // achromatic
  }else{
    var hue2rgb = function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 生成随机颜色
const genRandomColor = (length) => {
  if (length == 0) {
    return [];
  }
  var h = Math.random()*210/360; 
  var s = Math.random()*0.4+0.6; //0.6~1 
  var l = Math.random()*0.2+0.3; //0.3~0.5
  console.log(h,s,l);
  let tmp = hsl2rgb(h, s ,l);
  let r = tmp[0];
  let g = tmp[1];
  let b = tmp[2];
  console.log(r, g, b);

  if (length == 1) {
    return [`rgb(${r},${g},${b})`];
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
  if (typeof(spec.value) == "string") {
    return `'${String(spec.value)}'`;
  } else if(typeof(spec.value) == "number") {
    return String(spec.value);
  } else if (spec.operator === "attr") {
    return `${spec.data}.${spec.attribute}`;
  } else {
    let res = [];
    if(spec.parameters && spec.parameters.length > 0) {
      spec.parameters.forEach(item => {
        res.push(calString(item));
      })
    }
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
  // let ok = true;
  for (let i = 0; i < valueList.length; i++) {
    if (typeof (valueList[i]) != "number") {
      return true;
    }
    // if(valueList[i] % 1 != 0) {
    //   ok = false;
    // }
  }
  // return ok;
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
    let tmprow = [], tmpcol = [];
    for (let i = 0; i < 1 << num_attr; i++) {
      if (i == cur) continue;
      tmprow = [];
      tmpcol = [];
      for (let j = 0; j < num_attr; j++) {
        let item =
          j < rowlen ? row_header[j] : column_header[j - rowlen];
        console.log(item);
        if ((i >> j) & 1) {
          tmpcol.push(item);
        } else {
          tmprow.push(item);
        }
      }
      console.log(tmprow, tmpcol, body);
      let spec = genSpec(tmprow, tmpcol, body);
      spec["description"] = stringfySpec(spec);
      specList.push(spec);
    }
  }
  return specList;
  // this.storeAlterSpecList(specList);
}

const genSpec = (row_header, column_header, body) => {
  console.log(row_header, column_header);
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
  if (attrInfo) {
    attrInfo.forEach((item) => {
      unusedSpec.push(item);
    });
  }
  deleteUsedSpec(unusedSpec, row_header);
  deleteUsedSpec(unusedSpec, column_header);
  deleteUsedSpec(unusedSpec, body);
  if (!unusedSpec) {
    return specListWithAdd;
  }
  unusedSpec.forEach((item) => {
    let specList = [];
    let tmprow = [],
      tmpcol = [],
      tmpbody = [];
    if (row_header) {
      row_header.forEach((t) => {
        tmprow.push(t);
      });
    }
    if (column_header) {
      column_header.forEach((t) => {
        tmpcol.push(t);
      });
    }
    if (body) {
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
  if (!header) return;
  console.log(unusedSpec, header);
  header.forEach((item) => {
    // if (refineStrName(item).operator == "attr") {
    //   for (let j = 0; j < unusedSpec.length; j++) {
    //     let spec = unusedSpec[j];
    //     if (
    //       refineStrName(item).data == spec.data &&
    //       refineStrName(item).attribute == spec.attribute
    //     ) {
    //       unusedSpec.splice(j, 1);
    //       break;
    //     }
    //   }
    // }
    for(let j = 0; j < unusedSpec.length; j++) {
      if(compareObj(refineStrName(item), refineStrName(unusedSpec[j]))) {
        unusedSpec.splice(j, 1);
        break;
      }
    }
  });
}

const mapTable = (table, rowInfo, colInfo) => {
  // console.log(rowInfo, colInfo);
  // console.log(this.currentActiveGrid.row, this.currentActiveGrid.column);
  if (!rowInfo.len && !colInfo.len) return table;
  let rowSize = table.length;
  let columnSize = 0;
  for (let i = 0; i < rowSize; i++) {
    if (columnSize < table[i].length) {
      columnSize = table[i].length;
    }
  }
  let newRowSize = rowInfo.row - (colInfo.len ? colInfo.len : 1) + rowSize;
  let newColumnSize = colInfo.column - (rowInfo.len ? rowInfo.len : 1) + columnSize;
  let newTable = [];
  for (let i = 0; i < newRowSize; i++) {
    let tmp = [];
    for (let j = 0; j < newColumnSize; j++) {
      tmp.push(null);
    }
    newTable.push(tmp);
  }
  // console.log(rowSize, columnSize, newRowSize, newColumnSize);
  let oldx = colInfo.len ? colInfo.len : 1, oldy = rowInfo.len ? rowInfo.len : 1;
  let dx = rowInfo.row - oldx,
    dy = rowInfo.column;
  for (let i = oldx; i < rowSize; i++) {
    for (let j = 0; j < oldy; j++) {
      newTable[i + dx][j + dy] = table[i][j];
    }
  }
  dx = colInfo.row;
  dy = colInfo.column - oldy;
  for (let i = 0; i < oldx; i++) {
    for (let j = oldy; j < columnSize; j++) {
      newTable[i + dx][j + dy] = table[i][j];
    }
  }
  dx = rowInfo.row - oldx;
  dy = colInfo.column - oldy;
  for (let i = oldx; i < rowSize; i++) {
    for (let j = oldy; j < columnSize; j++) {
      newTable[i + dx][j + dy] = table[i][j];
    }
  }
  return newTable;
}

const rearrangeTable = (table, rowInfo, colInfo) => {
  if (!rowInfo || !colInfo) return table;
  if (!rowInfo.len && !colInfo.len) return table;
  let rowSize = table.length;
  let columnSize = 0;
  for (let i = 0; i < rowSize; i++) {
    if (columnSize < table[i].length) {
      columnSize = table[i].length;
    }
  }
  let newRowSize = rowSize - rowInfo.row + colInfo.len;
  let newColumnSize = columnSize - colInfo.column + rowInfo.len;
  let newTable = [];
  for (let i = 0; i < newRowSize; i++) {
    let tmp = [];
    for (let j = 0; j < newColumnSize; j++) {
      tmp.push(null);
    }
    newTable.push(tmp);
  }
  // console.log(rowSize, columnSize, newRowSize, newColumnSize);
  let oldx = colInfo.len ? colInfo.len : 1, oldy = rowInfo.len ? rowInfo.len : 1;
  let dx = rowInfo.row - oldx,
    dy = rowInfo.column;
  for (let i = oldx; i < newRowSize; i++) {
    for (let j = 0; j < oldy; j++) {
      newTable[i][j] = table[i + dx][j + dy];
    }
  }
  dx = colInfo.row;
  dy = colInfo.column - oldy;
  for (let i = 0; i < oldx; i++) {
    for (let j = oldy; j < newColumnSize; j++) {
      newTable[i][j] = table[i + dx][j + dy];
    }
  }
  dx = rowInfo.row - oldx;
  dy = colInfo.column - oldy;
  for (let i = oldx; i < newRowSize; i++) {
    for (let j = oldy; j < newColumnSize; j++) {
      newTable[i][j] = table[i + dx][j + dy];
    }
  }
  return newTable;
}

// 定义一个深拷贝函数  接收目标target参数
function deepClone(target) {
  // 定义一个变量
  let result;
  // 如果当前需要深拷贝的是一个对象的话
  if (typeof target === 'object') {
    // 如果是一个数组的话
    if (Array.isArray(target)) {
      result = []; // 将result赋值为一个数组，并且执行遍历
      for (let i = 0; i < target.length; i++) {
        // 递归克隆数组中的每一项
        result.push(deepClone(target[i]))
      }
      // 判断如果当前的值是null的话；直接赋值为null
    } else if (target === null) {
      result = null;
      // 判断如果当前的值是一个RegExp对象的话，直接赋值    
    } else if (target.constructor === RegExp) {
      result = target;
    } else {
      // 否则是普通对象，直接for in循环，递归赋值对象的所有值
      result = {};
      for (let i in target) {
        result[i] = deepClone(target[i]);
      }
    }
    // 如果不是对象的话，就是基本数据类型，那么直接赋值
  } else {
    result = target;
  }
  // 返回最终结果
  return result;
}

const findValueList = (item, attrInfo) => {
  if (!attrInfo) return [];
  for (let i = 0; i < attrInfo.length; i++) {
    if (compareObj(attrInfo[i].strName, item)) {
      return attrInfo[i].valueList;
    }
  }
}

const findColor = (item, attrInfo) => {
  if (!attrInfo) return [];
  for (let i = 0; i < attrInfo.length; i++) {
    if (compareObj(attrInfo[i].strName, item)) {
      return attrInfo[i].color;
    }
  }
}

const compareObj = (obj1, obj2) => {
  console.log(obj1, obj2);
  if(!obj1.operator && obj2.operator) {
    return false;
  } 
  if(!obj2.operator && obj1.operator) {
    return false;
  }
  if(!obj1.operator && !obj2.operator) {
    if(obj1.value && obj2.value) {
      return obj1.value == obj2.value;
    } else if ((typeof(obj1) == "number" || typeof(obj2) == "string") && (typeof(obj1) == "number" || typeof(obj2) == "string")) {
      return obj1 == obj2;
    } else {
      return false;
    }
  }
  if (obj1.operator == "attr" || obj1.data) {
    return obj1.data == obj2.data && obj1.attribute == obj2.attribute;
  } else {
    if (obj1.operator != obj2.operator || (!obj1.parameters && obj2.parameters) || (obj1.parameters && !obj2.parameters) || obj1.parameters.length != obj2.parameters.length) {
      return false;
    }
    if (obj1.parameters) {
      for (let i = 0; i < obj1.parameters.length; i++) {
        if (!compareObj(obj1.parameters[i], obj2.parameters[i])) {
          return false;
        }
      }
    }
    return true;
  }
}

const toFix = (s) => {
  if(typeof(s) != "number") return s;
  let t = Number(s);
  if(t % 1 != 0) {
    return t.toFixed(2);
  } else {
    return t;
  }
}

export default {
  generateSuggestions, genRandomColor, unique, checkValidSpec, stringfySpec, isCategorical, specObj2List, refineStrName, calString,
  genAlterSpec, genSpec, genExploreSpec, deleteUsedSpec, mapTable, deepClone, rearrangeTable, findValueList, findColor, compareObj,
  toFix
};
