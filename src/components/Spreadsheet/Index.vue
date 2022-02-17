<template>
  <div class="spreadsheet">
    <!-- Head -->
    <div class="row" v-if="head">
      <div
        class="cell-container head-container"
        v-for="(cellValue, i) in head"
        :key="`${name}_head_${i}`"
      >
        <cell
          :value="cellValue"
          :editable="false"
          :draggable="false"
          :cellColor="headColor[i]"
        />
      </div>
    </div>
    <!-- Content -->
    <div class="row" v-for="(row, i) in this.Table" :key="`${name}_row_${i}`">
      <div
        class="cell-container"
        v-for="(cellValue, j) in row"
        :key="`${name}_cell_${i}_${j}`"
        :class="{
          leftHightlightedCell: checkLeftHightlighted(i, j),
          topHightlightedCell: checkTopHightlighted(i, j),
        }"
      >
        <cell
          :value="cellValue"
          :key="cellValue"
          :editable="editable"
          @cell-change="cellChangeHandler(i, j, $event)"
          @left-drop="leftDropHandler(i, j, $event)"
          @top-drop="topDropHandler(i, j, $event)"
          @left-hover="leftHoverHandler(i, j, $event)"
          @top-hover="topHoverHandler(i, j, $event)"
          @drag-leave="dragLeaveHandler()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Cell from "./Cell.vue";
import { mapState, mapMutations, mapActions } from "vuex";
import Utils from "@/utils.js";

export default {
  name: "Spreadsheet",
  props: {
    table: Array,
    head: Array,
    headColor: Array,
    name: {
      type: String,
      default: "initTable",
    },
    initRowNum: {
      type: Number,
      default: 10,
    },
    initColNum: {
      type: Number,
      default: 4,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      Table: [[]],
      leftHightlightedRow: -1,
      leftHightlightedColumn: -1,
      topHightlightedRow: -1,
      topHightlightedColumn: -1,
      leftHovered: false,
      topHovered: false,
    };
  },
  created() {
    this.initTable();
  },
  beforeUpdate() {
    console.log("beforeUpdate");
    this.prettifyTable();
  },
  computed: {
    ...mapState(["dragSourceIsCell", "attrInfo", "row_header", "column_header"]),
  },
  methods: {
    ...mapActions(["storeSuggestion", "storePartialSpecSuggestion"]),
    initTable() {
      if (this.table) {
        if (this.name !== "targetTable") {
          this.Table = this.table;
        } else {
          // console.log(this.table);
          let table = this.table;
          let rowSize = table.length;
          let columnSize = 0;
          for (let i = 0; i < rowSize; i++) {
            if (columnSize < table[i].length) {
              columnSize = table[i].length;
            }
          }
          // console.log(rowSize, columnSize);
          for (let i = 0; i < rowSize; i++) {
            for (let j = 0; j < this.initColNum - table[i].length; j++) {
              table[i].push(null);
            }
          }
          if (rowSize < this.initRowNum) {
            for (let i = 0; i < this.initRowNum - rowSize; i++) {
              table.push(
                new Array(
                  columnSize < this.initColNum ? this.initColNum : columnSize
                )
              );
            }
          }
          this.Table = table;
        }
        // console.log(this.Table);
      } else {
        this.Table = new Array(this.initRowNum);
        for (let i = 0; i < this.initRowNum; i++) {
          this.Table[i] = new Array(this.initColNum);
        }
      }
    },
    prettifyTable() {
      // console.log(this.Table);
    },
    cellChangeHandler(row, column, value) {
      // this.Table[row][column] = value;
      const newRow = this.Table[row].slice(0);
      if (value.isDrag) {
        newRow[column] = JSON.parse(value.value);
        console.log("notice", newRow[column]);
      } else {
        if (value.value == "") {
          newRow[column] = null;
        } else {
          newRow[column] = {
            value: value.value,
            source: undefined,
          }; // 这里需要推荐匹配的attr
        }
      }
      this.$set(this.Table, row, newRow);
      console.log(row, column, value, this.Table);
      // this.calSuggestion();
      let partialSpecSuggestion = this.disambiguateCell(
        newRow[column].value,
        newRow[column].source
      );
      if (partialSpecSuggestion) {
        this.storePartialSpecSuggestion(partialSpecSuggestion);
        console.log(partialSpecSuggestion);
      }
    },
    leftDropHandler(row, column, value) {
      this.leftHovered = this.topHovered = false;
      console.log(row, column, value);
      if (column + value.valueList.length <= this.Table[row].length) {
        var newRow = new Array(this.Table[row].length);
        for (let i = 0; i < newRow.length; i++) {
          newRow[i] = this.Table[row][i];
        }
        for (let i = column; i < column + value.valueList.length; i++) {
          newRow[i] = {
            value: value.valueList[i - column],
            source: value.strName,
          };
        }
        this.$set(this.Table, row, newRow);
      } else {
        let delta = column + value.valueList.length - this.Table[0].length;
        for (let i = 0; i < this.Table.length; i++) {
          for (let j = 0; j < delta; j++) {
            this.Table[i].push(null);
          }
        }
        for (let i = column; i < column + value.valueList.length; i++) {
          this.Table[row][i] = {
            value: value.valueList[i - column],
            source: value.strName,
          };
        }
        this.$forceUpdate();
      }
      // this.calSuggestion();
    },
    topDropHandler(row, column, value) {
      this.leftHovered = this.topHovered = false;
      console.log(row, column, value);
      if (row + value.valueList.length <= this.Table.length) {
        for (let i = row; i < row + value.valueList.length; i++) {
          this.Table[i][column] = {
            value: value.valueList[i - row],
            source: value.strName,
          };
        }
        this.$forceUpdate();
      } else {
        let delta = row + value.valueList.length - this.Table.length;
        for (let i = 0; i < delta; i++) {
          this.Table.push(new Array(this.Table[0].length));
        }
        for (let i = row; i < row + value.valueList.length; i++) {
          this.Table[i][column] = {
            value: value.valueList[i - row],
            source: value.strName,
          };
        }
        this.$forceUpdate();
      }
      // this.calSuggestion();
    },
    leftHoverHandler(row, column, value) {
      this.topHovered = false;
      if (this.dragSourceIsCell) return;
      this.leftHovered = true;
      this.leftHightlightedRow = row;
      this.leftHightlightedColumn = column;
      console.log(row, column, value);
    },
    topHoverHandler(row, column, value) {
      this.leftHovered = false;
      if (this.dragSourceIsCell) return;
      this.topHovered = true;
      this.topHightlightedRow = row;
      this.topHightlightedColumn = column;
      console.log(row, column, value);
    },
    dragLeaveHandler() {
      this.leftHovered = this.topHovered = false;
    },
    checkLeftHightlighted(row, col) {
      return (
        this.leftHovered &&
        row == this.leftHightlightedRow &&
        col == this.leftHightlightedColumn
      );
    },
    checkTopHightlighted(row, col) {
      return (
        this.topHovered &&
        row == this.topHightlightedRow &&
        col == this.topHightlightedColumn
      );
    },

    /* 推荐计算部分 */
    searchValue(value) {
      let res = [];
      let attrInfo = this.attrInfo;
      for (let i = 0; i < attrInfo.length; i++) {
        let attr = attrInfo[i];
        if (this.isinValueList(value, attr.valueList)) {
          res.push({
            operator: "attr",
            data: attr.data,
            attribute: attr.attribute,
          });
        }
      }
      return res;
    },

    isinValueList(value, list) {
      if (value.isRightOpen) {
        for (let i = 0; i < list.length; i++) {
          if (
            list[i].isRightOpen == value.isRightOpen &&
            list[i].lower == value.lower &&
            list[i].upper == value.upper
          )
            return true;
        }
      } else {
        for (let i = 0; i < list.length; i++) {
          if (list[i] == value) return true;
        }
      }
      return false;
    },

    matchValueToColumn() {
      let table = this.Table;
      for (var i = 0; i < table.length; i++) {
        for (var j = 0; j < table[0].length; j++) {
          if (
            !table[i][j] ||
            table[i][j].source ||
            table[i][j].value == "" ||
            !table[i][j].value
          )
            continue;
          table[i][j].suggestedSource = this.searchValue(table[i][j].value);
        }
      }
    },

    dfsAttrOptions(okList, candidateList, tmpList, res, index) {
      if (index == candidateList.length) {
        let tmp = new Array();
        for (let i in okList) tmp.push(i);
        for (let i in tmpList) tmp.push(i);
        res.push(tmp);
        return;
      }
      for (let attr in candidateList[index]) {
        tmpList.push(attr);
        this.dfsAttrOptions(okList, candidateList, tmpList, res, index + 1);
        tmpList.splice(-1, 1);
      }
    },

    getAttrOptions() {
      let table = this.Table;
      let res = [];
      let okList = [];
      let candidateList = [];
      for (var i = 0; i < table.length; i++) {
        for (var j = 0; j < table[0].length; j++) {
          if (!table[i][j]) continue;
          if (table[i][j].source) {
            if (
              -1 ==
              okList.findIndex((value) => {
                return (
                  JSON.stringify(table[i][j].source) == JSON.stringify(value)
                );
              })
            ) {
              okList.push(table[i][j].source);
            }
          } else {
            if (
              -1 ==
              candidateList.findIndex((value) => {
                return (
                  JSON.stringify(table[i][j].suggestedSource) ==
                  JSON.stringify(value)
                );
              })
            ) {
              candidateList.push(table[i][j].suggestedSource);
            }
          }
        }
      }
      if (candidateList.length == 0) {
        return [okList];
      }
      this.dfsAttrOptions(okList, candidateList, [], res, 0);
      return res;
    },

    dfsSpecOptions(
      option,
      rowHeaderList,
      columnHeaderList,
      bodyList,
      specOptions,
      index
    ) {
      if (index == option.length) {
        var item = new Object();
        // row_header
        if (rowHeaderList.length == 1) {
          item["row_header"] = rowHeaderList[0];
        } else if (rowHeaderList.length > 1) {
          let tmp = rowHeaderList[0];
          for (let i = 1; i < rowHeaderList.length; i++) {
            tmp = {
              operator: "cross",
              parameters: [tmp, rowHeaderList[i]],
            };
          }
          item["row_header"] = tmp;
        }
        // column_header
        if (columnHeaderList.length == 1) {
          item["column_header"] = columnHeaderList[0];
        } else if (columnHeaderList.length > 1) {
          let tmp = columnHeaderList[0];
          for (let i = 1; i < columnHeaderList.length; i++) {
            tmp = {
              operator: "cross",
              parameters: [tmp, columnHeaderList[i]],
            };
          }
          item["column_header"] = tmp;
        }
        // body
        if (bodyList.length == 1) {
          item["body"] = bodyList[0];
        } else if (bodyList.length > 1) {
          let tmp = bodyList[0];
          for (let i = 1; i < bodyList.length; i++) {
            tmp = {
              operator: "cross",
              parameters: [tmp, bodyList[i]],
            };
          }
          item["body"] = tmp;
        }
        if (Utils.checkValidSpec(item)) {
          specOptions.push(item);
        }
        return;
      }
      let attr = option[index];
      rowHeaderList.push(attr);
      this.dfsSpecOptions(
        option,
        rowHeaderList,
        columnHeaderList,
        bodyList,
        specOptions,
        index + 1
      );
      rowHeaderList.splice(-1, 1);
      console.log("assert", rowHeaderList.length);
      columnHeaderList.push(attr);
      this.dfsSpecOptions(
        option,
        rowHeaderList,
        columnHeaderList,
        bodyList,
        specOptions,
        index + 1
      );
      columnHeaderList.splice(-1, 1);
      bodyList.push(attr);
      this.dfsSpecOptions(
        option,
        rowHeaderList,
        columnHeaderList,
        bodyList,
        specOptions,
        index + 1
      );
      bodyList.splice(-1, 1);
    },

    mapColumnToSpec() {
      let attrOptions = this.getAttrOptions();
      let specOptions = [];
      attrOptions.forEach((option) => {
        console.log(option);
        this.dfsSpecOptions(option, [], [], [], specOptions, 0);
      });
      console.log(specOptions);
      specOptions.forEach((option) => {
        option["description"] = Utils.stringfySpec(option);
      });
      // this.storeSuggestion(specOptions);
    },

    // 为当前表格计算推荐视图，在每次更新target table后调用
    calSuggestion() {
      console.log(this.name);
      if (this.name !== "targetTable") return;
      this.matchValueToColumn();
      this.mapColumnToSpec();
    },

    // 对于用户进行的手动输入格子操作，进行排除歧义的操作
    disambiguateCell(value, dragSource) {
      let isHeaderExist = this.row_header.length > 0 || this.column_header.length > 0;
      console.log(value, dragSource);
      if (dragSource) {
        let sourceDescription = Utils.calString(dragSource);
        let partialSpecList = [
          {
            row_header: dragSource,
            description: `(${sourceDescription}), () => ()`,
          },
          {
            column_header: dragSource,
            description: `(), (${sourceDescription}) => ()`,
          },
        ];
        if(isHeaderExist) {
          partialSpecList.push({
            body: dragSource,
            description: `(), () => (${sourceDescription})`
          });
        }
        return [
          {
            itemDescription: '"' + value + '"',
            source: sourceDescription,
            partialSpecList
          },
        ];
      }
      let source = this.searchValue(value);
      let res = [];
      if (source.length == 0) {
        this.$message.error("Failed to find the source of the input");
        return;
      }
      for (let i = 0; i < source.length; i++) {
        let key = source[i];
        let tmp = {};
        let sourceDescription = Utils.calString(key);
        tmp["itemDescription"] = '"' + value + '"';
        tmp["source"] = sourceDescription;
        let partialSpecList = [
          {
            row_header: key,
            description: `(${sourceDescription}), () => ()`,
          },
          {
            column_header: key,
            description: `(), (${sourceDescription}) => ()`,
          },
        ];
        if(isHeaderExist) {
          partialSpecList.push({
            body: key,
            description: `(), () => (${sourceDescription})`
          });
        }
        tmp["partialSpecList"] = partialSpecList;
        res.push(tmp);
      }
      return res;
    },
  },
  components: {
    Cell,
  },
};
</script>

<style>
.spreadsheet {
  text-align: left;
}

.row {
  width: 100%;
  height: 32px;
  display: flex;
  flex-direction: row;
}

.row:first-child {
  height: 32.5px;
}

.row:last-child {
  height: 32.5px;
}

.head-container .cell {
  text-align: center;
}

.cell-container {
  flex: 1 1;
  padding: 0 5px;
  border: 1px solid #bbb;
  font: 100 16px/20px Times;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}

.cell-container .cell {
  width: calc(100% - 10px);
  min-height: 20px;
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
}

.leftHightlightedCell {
  border-left-color: red;
  border-left-width: 3px;
}

.topHightlightedCell {
  border-top-color: red;
  border-top-width: 3px;
}

.cell-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

/* .row:first-child .cell-container {
  border-top: 1.5px solid ;
}

.row .cell-container:first-child {
  border-left: 1.5px solid;
}

.row .cell-container:last-child {
  border-right: 1.5px solid ;
}

.row:last-child .cell-container {
  border-bottom: 1.5px solid ;
} */
</style>
