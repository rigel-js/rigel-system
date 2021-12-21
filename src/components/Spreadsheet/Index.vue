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
      default: 15,
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
  computed: {
    ...mapState(["dragSourceIsCell", "attrInfo"]),
  },
  methods: {
    initTable() {
      if (this.table) {
        this.Table = this.table;
      } else {
        this.Table = new Array(this.initRowNum);
        for (let i = 0; i < this.initRowNum; i++) {
          this.Table[i] = new Array(this.initColNum);
        }
      }
    },
    cellChangeHandler(row, column, value) {
      // this.Table[row][column] = value;
      const newRow = this.Table[row].slice(0);
      if (value.isDrag) {
        newRow[column] = JSON.parse(value.value);
        console.log("notice", newRow[column]);
      } else {
        newRow[column] = {
          value: value.value,
          source: undefined,
        }; // 这里需要推荐匹配的attr
      }
      this.$set(this.Table, row, newRow);
      console.log(row, column, value, this.Table);
      this.calSuggestion();
    },
    leftDropHandler(row, column, value) {
      this.leftHovered = this.topHovered = false;
      console.log(row, column, value);
      if (column + value.valueList.length <= this.Table[row].length) {
        var newRow = new Array(this.Table[row].length);
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
        this.calSuggestion();
      }
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
        this.calSuggestion();
      }
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
      for(let relationAttrInfo in attrInfo) {
        for(let attr in relationAttrInfo) {
          if(value in attr.valueList) {
            res.push({
              op: "attr",
              tableName: attr.tableName,
              attrName: attr.attrName
            });
          }
        }
      }
      return res;
    },
    
    matchValueToColumn() {
      let table = this.Table;
      for (var i = 0; i < table.length; i++) {
        for (var j = 0; j < table[0].length; j++) {
          if (!table[i][j] || table[i][j].source) continue;
          table[i][j].suggestedSource = this.searchValue(table[i][j].value);
        }
      }
    },

    // 为当前表格计算推荐视图，在每次更新target table后调用
    calSuggestion() {
      if (this.name !== "targetTable") return;
      this.matchValueToColumn();
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
