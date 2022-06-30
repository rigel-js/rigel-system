<template>
  <div class="spreadsheet">
    <!-- Head -->
    <div class="row" v-if="head">
      <div
        class="cell-container"
        v-for="(cellValue, i) in head"
        :key="`${name}_head_${i}`"
      >
        <cell
          :value="cellValue"
          :editable="false"
          :draggable="false"
          :color="headColor"
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
          bgcolor: head? (i%2==0) : (i%2==1)
        }"
      >
        <cell
          :value="cellValue"
          :editable="editable"
          :draggable="contentDraggable"
          :givenId="`${name}_cell_${i}_${j}`"
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
    headColor: String,
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
      default: 10,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    contentDraggable: {
      type: Boolean,
      default: true,
    },
    fixedRowNum: {
      type: Number,
      default: 0,
    },
    fixedColNum: {
      type: Number,
      default: 0,
    },
    minRowNum: {
      type: Number,
      default: 10,
    },
    minColNum: {
      type: Number,
      default: 20,
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
  watch: {
    Table(val) {
      if (this.name == "targetTable") {
        this.storeCurrentTable(val);
      }
    },
  },
  computed: {
    ...mapState([
      "dragSourceIsCell",
      "attrInfo",
      "row_header",
      "column_header",
      "body",
      "currentActiveGrid",
      "rowInfo",
      "colInfo",
      "previewTable",
      "partialSpecSuggestion",
    ]),
  },
  methods: {
    ...mapActions([
      "storeSuggestion",
      "storePartialSpecSuggestion",
      "storeDeleteSpecSuggestion",
      "storeCurrentTable",
      "storeCurrentActiveGrid",
      "storePreviewTable",
      "storeReapplyPartialSpec",
      "storeCurrentState",
    ]),
    initTable() {
      let finalRowNum = this.fixedRowNum ? this.fixedRowNum : (this.initRowNum < this.minRowNum ? this.minRowNum : this.initRowNum);
      let finalColNum = this.fixedRowNum ? this.fixedRowNum : (this.initColNum < this.minColNum ? this.minColNum : this.initColNum);
      if (this.head) {
        let tmp = finalColNum - this.head.length;
        for(let j = 0; j < tmp; j++) {
          this.head.push(null);
        }
      }
      if (this.table) {
        if(this.fixedRowNum && this.fixedColNum) {
          let rowSize = this.table.length;
          let columnSize = 0;
          for (let i = 0; i < rowSize; i++) {
            if (columnSize < this.table[i].length) {
              columnSize = this.table[i].length;
            }
          }
          this.Table = [];
          for(let i = 0; i < this.fixedRowNum; i++) {
            let tmp = [];
            for(let j = 0; j < this.fixedColNum; j++) {
              tmp.push(null);
            }
            this.Table.push(tmp);
            for(let j = 0; j < this.fixedColNum; j++) {
              if(i < rowSize && j < columnSize) {
                this.Table[i][j] = this.table[i][j];
              } else {
                this.Table[i][j] = null;
              }
            }
          }
          return;
        } else {
          console.log(this.table);
          let table = this.table;
          let rowSize = table.length;
          let columnSize = 0;
          for (let i = 0; i < rowSize; i++) {
            if (columnSize < table[i].length) {
              columnSize = table[i].length;
            }
          }
          finalColNum = finalColNum < columnSize ? columnSize : finalColNum;
          console.log(finalColNum);
          // console.log(rowSize, columnSize);
          for (let i = 0; i < rowSize; i++) {
            // console.log(table[i].length);
            let tmp = finalColNum - table[i].length;
            for (let j = 0; j < tmp; j++) {
              // console.log("push")
              table[i].push(null);
            }
          }
          if (rowSize < finalRowNum) {
            for (let i = 0; i < finalRowNum - rowSize; i++) {
              table.push(
                new Array(
                  columnSize < finalColNum ? finalColNum : columnSize
                )
              );
            }
          }
          this.Table = table;
        }
        console.log(this.Table);
      } else {
        this.Table = new Array(finalRowNum);
        for (let i = 0; i < finalRowNum; i++) {
          this.Table[i] = new Array(finalColNum);
        }
      }
    },
    cellChangeHandler(row, column, value) {
      // this.Table[row][column] = value;
      if(this.partialSpecSuggestion && this.partialSpecSuggestion.length > 0) {
        this.$message.info("To perform the interaction, ambiguities should be resolved. Defaultly, the first suggestion is applied.");
        this.storeReapplyPartialSpec(true);
        return;
      }
      const newRow = this.Table[row].slice(0);
      let oldValue = newRow[column];
      let isOldValueValid = oldValue && oldValue.value != "";
      let isNewValueValid = value.value && value.value != "";
      if (!isOldValueValid && !isNewValueValid) {
        return; //相当于啥也没输，无事发生
      } else if (isOldValueValid && isNewValueValid) {
        if (oldValue.value == value.value) {
          return;
        } else {
          this.$message.error("Cannot alter existing cell partially"); //不可以修改部分的cell
          newRow[column] = oldValue;
          this.$set(this.Table, row, newRow);
          let el = document.getElementById(`${this.name}_cell_${row}_${column}`);
          el.innerText = oldValue.value;
          return;
        }
      } else if (!isOldValueValid && isNewValueValid) {
        // 相当于值添加
        if (value.isDrag) {
          newRow[column] = JSON.parse(value.value);
          console.log("notice", newRow[column]);
        } else {
          if (!value.value || value.value == "") {
            newRow[column] = null;
          } else {
            newRow[column] = {
              value: value.value,
              source: value.source,
            }; // 这里需要推荐匹配的attr
          }
        }
        // this.calSuggestion();
        this.storeCurrentActiveGrid({
          row,
          column,
        });
        let partialSpecSuggestion;
        try {
          partialSpecSuggestion = this.disambiguateCell(
            newRow[column].value,
            newRow[column].source
          );
        } catch (err) {
          if(err.message == "INPUT") {
            newRow[column] = null;
            let el = document.getElementById(`${this.name}_cell_${row}_${column}`);
            el.innerText = null;
          } else {
            throw err;
          }
        }

        this.$set(this.Table, row, newRow);
        this.$forceUpdate();
        console.log(row, column, value, this.Table);

        if (partialSpecSuggestion) {
          this.storePartialSpecSuggestion(partialSpecSuggestion);
          console.log(partialSpecSuggestion);
        }
      } else {
        // 删除单个cell中的所有内容
        console.log("delte");
        console.log(row, column, this.rowInfo, this.colInfo);
        newRow[column] = null;
        this.$set(this.Table, row, newRow);
        this.storeCurrentActiveGrid({
          row,
          column,
        });

        let originAttr, partialSpec = {}, deleteSpecSuggestion = [];
        if (row >= this.rowInfo.row && column >= this.colInfo.column) {
          //body
          originAttr = oldValue.source;
          partialSpec["body"] = originAttr;
          let sourceDescription = Utils.calString(originAttr);
          partialSpec["description"] = `(), () => (${sourceDescription})`;
          deleteSpecSuggestion = [partialSpec];
        } else if (row < this.rowInfo.row && column >= this.colInfo.column) {
          //column
          if (
            this.body.length > 0 &&
            this.row_header.length == 0 &&
            this.column_header.length == 1
          ) {
            this.$message.info("No recommendation since the header will be empty");
            return; // header会被清空，这种情况不推荐
          }
          originAttr = this.column_header[row - this.colInfo.row];
          partialSpec["column_header"] = originAttr;
          let sourceDescription = Utils.calString(originAttr);
          partialSpec["description"] = `(), (${sourceDescription}) => ()`;
          deleteSpecSuggestion.push(partialSpec);
          let valueList = Utils.findValueList(originAttr, this.attrInfo);
          let newValueList = [originAttr];
          if(Utils.isCategorical(valueList)) {
            for(let i = 0; i < valueList.length; i++) {
              if(valueList[i] != oldValue.value) {
                newValueList.push({
                  value: valueList[i]
                });
              }
            }
            let strName = {
              operator: "filterByValue",
              parameters: newValueList
            };
            deleteSpecSuggestion.push({
              isFilter: true,
              column_header: strName,
              description: `Filter ${sourceDescription} by value`,
            });
          }
        } else if (column < this.colInfo.column && row >= this.rowInfo.row) {
          //row
          if (
            this.body.length > 0 &&
            this.column_header.length == 0 &&
            this.row_header.length == 1
          ) {
            this.$message.info("No recommendation since the header will be empty");
            return; // header会被清空，这种情况不推荐
          }
          originAttr = Utils.refineStrName(this.row_header[column - this.rowInfo.column]);
          console.log(originAttr);
          partialSpec["row_header"] = originAttr;
          let sourceDescription = Utils.calString(originAttr);
          partialSpec["description"] = `(${sourceDescription}), () => ()`;
          deleteSpecSuggestion.push(partialSpec);
          let valueList = Utils.findValueList(originAttr, this.attrInfo);
          console.log(valueList);
          let newValueList = [originAttr];
          if(Utils.isCategorical(valueList)) {
            for(let i = 0; i < valueList.length; i++) {
              if(valueList[i] != oldValue.value) {
                newValueList.push({
                  value: valueList[i]
                });
              }
            }
            let strName = {
              operator: "filterByValue",
              parameters: newValueList
            };
            deleteSpecSuggestion.push({
              isFilter: true,
              row_header: strName,
              description: `Filter ${sourceDescription} by value`,
            });
          }
        } else {
          return;
        }

        this.storeDeleteSpecSuggestion(deleteSpecSuggestion);
      }
      this.storeCurrentState();
    },
    leftDropHandler(row, column, value) {
      this.leftHovered = this.topHovered = false;
      console.log(row, column, value);
      if(this.previewTable) {
        this.$message.info("To perform the interaction, ambiguities should be resolved. Defaultly, the first suggestion is applied.");
        this.storeReapplyPartialSpec(true);
        return;
      }
      let hasCellConflict = false;
      if (column + value.valueList.length <= this.Table[row].length) {
        var newRow = new Array(this.Table[row].length);
        for (let i = 0; i < newRow.length; i++) {
          newRow[i] = this.Table[row][i];
        }
        for (let i = column; i < column + value.valueList.length; i++) {
          if(this.Table[row][i]) {
            let originalValue = this.Table[row][i].value ? this.Table[row][i].value : this.Table[row][i];
            newRow[i] = {
              value: `${originalValue}/${value.valueList[i - column]}`,
              source: value.strName,
            };
            hasCellConflict = true;
          } else {
            newRow[i] = {
              value: value.valueList[i - column],
              source: value.strName,
            };
          }
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
          if(this.Table[row][i]) {
            let originalValue = this.Table[row][i].value ? this.Table[row][i].value : this.Table[row][i];
            this.Table[row][i] = {
              value: `${originalValue}/${value.valueList[i - column]}`,
              source: value.strName,
            };
            hasCellConflict = true;
          } else {
            this.Table[row][i] = {
              value: value.valueList[i - column],
              source: value.strName,
            };
          }
        }
        this.$set(this.Table, row, this.Table[row]);
        this.$forceUpdate();
      }
      // this.calSuggestion();
      this.storeCurrentActiveGrid({
        row,
        column,
      });
      let partialSpecSuggestion = this.disambiguateRow(
        value.valueList,
        value.strName,
        true
      );
      
      if (partialSpecSuggestion) {
        this.storePartialSpecSuggestion(partialSpecSuggestion);
        console.log(partialSpecSuggestion);
      }
      if(hasCellConflict) {
        this.$message.info("Value conflict exists");
      }
      this.storeCurrentState();
    },
    topDropHandler(row, column, value) {
      this.leftHovered = this.topHovered = false;
      console.log(row, column, value);
      if(this.previewTable) {
        this.$message.info("To perform the interaction, ambiguities should be resolved. Defaultly, the first suggestion is applied.");
        this.storeReapplyPartialSpec(true);
        return;
      }
      let hasCellConflict = false;
      if (row + value.valueList.length <= this.Table.length) {
        for (let i = row; i < row + value.valueList.length; i++) {
          if(this.Table[i][column]) {
            let originalValue = this.Table[i][column].value ? this.Table[i][column].value : this.Table[i][column];
            this.Table[i][column] = {
              value: `${originalValue}/${value.valueList[i - row]}`,
              source: value.strName,
            };
            hasCellConflict = true;
          } else {
            this.Table[i][column] = {
              value: value.valueList[i - row],
              source: value.strName,
            };
          }
          this.$set(this.Table, i, this.Table[i]);
        }
        console.log(this.Table);
        // this.$forceUpdate();
      } else {
        let delta = row + value.valueList.length - this.Table.length;
        for (let i = 0; i < delta; i++) {
          this.Table.push(new Array(this.Table[0].length));
        }
        for (let i = row; i < row + value.valueList.length; i++) {
          if(this.Table[i][column]) {
            let originalValue = this.Table[i][column].value ? this.Table[i][column].value : this.Table[i][column];
            this.Table[i][column] = {
              value: `${originalValue}/${value.valueList[i - row]}`,
              source: value.strName,
            };
            hasCellConflict = true;
          } else {
            this.Table[i][column] = {
              value: value.valueList[i - row],
              source: value.strName,
            };
          }
          this.$set(this.Table, i, this.Table[i]);
        }
        console.log(this.Table);
        // this.$forceUpdate();
      }
      // this.calSuggestion();
      this.storeCurrentActiveGrid({
        row,
        column,
      });
      let partialSpecSuggestion = this.disambiguateRow(
        value.valueList,
        value.strName,
        false
      );
      if (partialSpecSuggestion) {
        this.storePartialSpecSuggestion(partialSpecSuggestion);
        console.log(partialSpecSuggestion);
      }
      if(hasCellConflict) {
        this.$message.info("Value conflict exists");
      }
      this.storeCurrentState();
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

    // 对于用户进行的手动输入格子操作，进行排除歧义的操作
    disambiguateCell(value, dragSource) {
      let isHeaderExist =
        this.row_header.length > 0 || this.column_header.length > 0;
      // console.log(value, dragSource);
      if (dragSource) {
        let sourceDescription = Utils.calString(dragSource);
        let partialSpecList = [
          {
            row_header: dragSource,
            description: `Map ${sourceDescription} to the row channel: (${sourceDescription}), () => ()`,
          },
          {
            column_header: dragSource,
            description: `Map ${sourceDescription} to the column channel: (), (${sourceDescription}) => ()`,
          },
        ];
        if (isHeaderExist) {
          partialSpecList.push({
            body: dragSource,
            description: `Map ${sourceDescription} to the cell channel: (), () => (${sourceDescription})`,
          });
        }
        return [
          {
            itemDescription: '"' + value + '"',
            source: sourceDescription,
            partialSpecList,
          },
        ];
      }
      let source = this.searchValue(value);
      let res = [];
      if (source.length == 0) {
        this.$message.error("Failed to find the source of the input");
        throw new Error("INPUT");
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
            description: `Map ${sourceDescription} to the row channel: (${sourceDescription}), () => ()`,
          },
          {
            column_header: key,
            description: `Map ${sourceDescription} to the column channel: (), (${sourceDescription}) => ()`,
          },
        ];
        if (isHeaderExist) {
          partialSpecList.push({
            body: key,
            description: `Map ${sourceDescription} to the cell channel: (), () => (${sourceDescription})`,
          });
        }
        tmp["partialSpecList"] = partialSpecList;
        res.push(tmp);
      }
      return res;
    },
    disambiguateRow(value, dragSource, isRow) {
      // console.log(value, dragSource);
      if (!value || value.length == 0) return;
      let isHeaderExist =
        this.row_header.length > 0 || this.column_header.length > 0;
      let itemDescription = `The ${isRow ? "row" : "column"} beginning with "${
        value[0]
      }"`;
      let sourceDescription = Utils.calString(dragSource);
      let partialSpecList = [];
      if (isRow) {
        partialSpecList.push({
          column_header: dragSource,
          description: `Map ${sourceDescription} to the column channel: (), (${sourceDescription}) => ()`,
        });
      } else {
        partialSpecList.push({
          row_header: dragSource,
          description: `Map ${sourceDescription} to the row channel: (${sourceDescription}), () => ()`,
        });
      }
      if (isHeaderExist) {
        partialSpecList.push({
          body: dragSource,
          description: `Map ${sourceDescription} to the cell channel: (), () => (${sourceDescription})`,
        });
      }
      return [
        {
          itemDescription,
          source: sourceDescription,
          partialSpecList,
        },
      ];
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
  /* display: table; */
  /* overflow: scroll; */
}

.row {
  width: 100%;
  height: 32px;
  /* display: flex;
  flex-direction: row; */
  display: table-row;
}

/* .row:first-child {
  height: 32.5px;
}

.row:last-child {
  height: 32.5px;
} */

.head-container .cell {
  text-align: center;
}

.cell-container {
  /* flex: 1 1; */
  border: 1px solid #bbb;
  /* font: 100 16px/20px Times; */
  overflow-y: auto;
  display: table-cell;
  min-width: 100px;
}

.cell-container .cell {
  width: 100%;
  /* height: 100%; */
  min-height: 20px;
  line-height: 20px;
  vertical-align: center;
  padding: 5px 5px 5px 5px;
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

.bgcolor {
  background-color: #eaebee;
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
