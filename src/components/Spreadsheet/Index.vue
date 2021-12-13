<template>
  <div class="spreadsheet">
    <!-- Head -->
    <div class="row" v-if="head">
      <div
        class="cell-container head-container"
        v-for="(cellValue, i) in head"
        :key="`${name}_head_${i}`"
      >
        <cell :initValue="cellValue" :editable="false" :draggable="false" :cellColor="headColor[i]"/>
      </div>
    </div>
    <!-- Content -->
    <div
      class="row"
      v-for="(row, i) in table ? table : initTable"
      :key="`${name}_row_${i}`"
    >
      <div
        class="cell-container"
        v-for="(cellValue, j) in row"
        :key="`${name}_cell_${i}_${j}`"
      >
        <cell
          :initValue="cellValue"
          :editable="editable"
          @cell-change="cellChangeHandler(i, j, $event)"
          @left-change="leftChangeHandler(i, j, $event)"
          @upper-change="upperChangeHandler(i, j, $event)"
          @left-hover="leftHoverHandler(i, j, $event)"
          @upper-hover="upperHoverHandler(i, j, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Cell from "./Cell.vue";

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
  computed: {
    initTable() {
      return new Array(this.initRowNum).fill(
        new Array(this.initColNum).fill("")
      );
    },
  },
  methods: {
    cellChangeHandler(row, column, value) {
      console.log(row, column, value);
    },
    leftChangeHandler(row, column, value) {
      console.log(row, column, value);
    },
    upperChangeHandler(row, column, value) {
      console.log(row, column, value);
    },
    leftHoverHandler(row, column, value) {
      console.log(row, column, value);
    },
    upperHoverHandler(row, column, value) {
      console.log(row, column, value);
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

.cell-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.row:first-child .cell-container {
  border-top: 1.5px solid #bbb;
}

.row .cell-container:first-child {
  border-left: 1.5px solid #bbb;
}

.row .cell-container:last-child {
  border-right: 1.5px solid #bbb;
}

.row:last-child .cell-container {
  border-bottom: 1.5px solid #bbb;
}
</style>
