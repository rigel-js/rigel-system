<template>
  <div
    class="cell"
    :title="this.realValue"
    :draggable="draggable"
    :data-info="JSON.stringify(this.cellValue)"
    @dragstart="dragHandler"
    @drop="dropHandler"
    @dragover="allowDrop"
    @dragleave="dragLeaveHandler"
    :style="{ 'background-color': cellColor }"
    @click="clickHandler"
    @blur="blurHandler"
    @input="inputHandler"
    :contenteditable="editable && this.canedit"
  >
    {{ this.realValue }}
    <div 
      class="recommend-list"
      v-if="this.alterValue.length > 0"
      :style="{ left: left + 'px', top: top + 'px' }"
      :contenteditable="false"
    >
      <div v-for="(value, index) in this.alterValue" :key="index" class="recommend-item" @click="applyHandler($event, value)">
        {{`${value.value} (${value.description})`}}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Utils from '@/utils.js';
export default {
  name: "SpreadsheetCell",
  props: {
    value: [String, Object],
    editable: {
      type: Boolean,
      default: false,
    },
    draggable: {
      type: Boolean,
      default: true,
    },
    cellColor: {
      type: String,
      default: "white",
    },
  },
  computed: {
    ...mapState(["attrInfo"]),
  },
  data() {
    return {
      cellValue: "",
      realValue: "",
      canedit: false,
      alterValue: [],
      left: 0,
      top: 0,
    };
  },
  created() {
    this.cellValue = this.value;
    let tmp = this.cellValue;
    if (tmp) {
      if (tmp.value) {
        if (!tmp.value.lower) {
          this.realValue = String(tmp.value);
        } else if (tmp.value.isRightOpen == true) {
          this.realValue = `[${tmp.value.lower}, ${tmp.value.upper})`;
        } else {
          this.realValue = `[${tmp.value.lower}, ${tmp.value.upper}]`;
        }
      } else {
        this.realValue = String(tmp);
      }
    } else {
      this.realValue = "";
    }
  },
  methods: {
    ...mapActions(["setDragSource"]),
    dragHandler(event) {
      // event.dataTransfer.setData("dragValue", event.target.innerText);
      event.dataTransfer.setData("info", event.target.dataset.info);
      event.dataTransfer.setData("type", "cell");
      sessionStorage.setItem("type", "cell");
      this.setDragSource(true);
      this.$emit("drag-start");
    },

    allowDrop(event) {
      if (
        sessionStorage.getItem("type") != "cell" &&
        sessionStorage.getItem("type") != "attr"
      ) {
        return;
      }
      if (this.editable) {
        event.preventDefault();
        if (event.offsetY > 5) {
          //左边沿
          this.$emit("left-hover");
        } else {
          //上边沿
          this.$emit("top-hover");
        }
      }
    },

    dropHandler(event) {
      if (
        sessionStorage.getItem("type") != "cell" &&
        sessionStorage.getItem("type") != "attr"
      ) {
        return;
      }
      if (this.editable) {
        event.preventDefault();
        if (event.dataTransfer.getData("type") === "cell") {
          let info = {
            value: event.dataTransfer.getData("info"),
            isDrag: true,
          };
          this.$emit("cell-change", info);
          this.$emit("drag-leave");
        } else {
          console.log("attr!");
          console.log(event.offsetX, event.offsetY);
          let attr = JSON.parse(event.dataTransfer.getData("info"));
          if (event.offsetY > 5) {
            //左边沿
            this.$emit("left-drop", attr);
          } else {
            //上边沿
            this.$emit("top-drop", attr);
          }
        }
      }
    },

    blurHandler(event) {
      console.log("blur");
      if(!this.canedit) return;
      this.canedit = false;
      this.alterValue = [];
      let index = 0;
      for(; index < event.target.innerText.length; index++) {
        if(event.target.innerText[index] === "\n") {
          break;
        }
      }
      let info = {
        value: event.target.innerText.substr(0, index),
        isDrag: false,
      };
      this.$emit("cell-change", info);
    },

    inputHandler(event) {
      let tmp = event.target.getBoundingClientRect();
      this.top = tmp.top + tmp.height + 5;
      this.left = tmp.left;
      console.log(event.target.innerText);
      let index = 0;
      for(; index < event.target.innerText.length; index++) {
        if(event.target.innerText[index] === "\n") {
          break;
        }
      }
      this.recommendValue(event.target.innerText.substr(0, index));
    },

    dragLeaveHandler(event) {
      this.$emit("drag-leave");
    },

    clickHandler(event) {
      this.canedit = true;
    },

    recommendValue(value) {
      console.log("recom", value);
      if (value.length == 0) {
        return [];  // 非字母开头的字符串不推荐
      }
      let res = [],
        res_no_capital = [];
      for (let i = 0; i < this.attrInfo.length; i++) {
        let valueList = this.attrInfo[i].valueList;
        if (valueList) {
          for (let j = 0; j < valueList.length; j++) {
            let isPrefix = true;
            if (value.length > valueList[j].length) continue;
            for (let k = 0; k < value.length; k++) {
              if (valueList[j][k] != value[k]) {
                isPrefix = false;
                break;
              }
            }
            if (isPrefix) {
              res.push({
                value: valueList[j],
                source: this.attrInfo[i].strName,
                description: Utils.calString(this.attrInfo[i].strName),
              });
              continue;
            }
            isPrefix = true;
            let value1 = new String(valueList[j]);
            value1 = value1.toLowerCase();
            let value2 = new String(value);
            value2 = value2.toLowerCase();
            for (let k = 0; k < value2.length; k++) {
              if (value1[k] != value2[k]) {
                isPrefix = false;
                break;
              }
            }
            if (isPrefix) {
              res_no_capital.push({
                value: valueList[j],
                source: this.attrInfo[i].strName,
                description: Utils.calString(this.attrInfo[i].strName),
              });
            }
          }
        }
      }
      this.alterValue = res.concat(res_no_capital);
      console.log(this.alterValue);
    },

    applyHandler(event, value) {
      this.canedit = false;
      this.alterValue = [];
      console.log("apply", value);
      let info = {
        value: value.value,
        isDrag: false,
        source: value.source,
      };
      this.$emit("cell-change", info);
    }

    // setClass(leftHightlighted, topHightlighted) {
    //   let cl = {cell: true};
    //   if(leftHightlighted) cl['leftHightlightedCell'] = true;
    //   if(topHightlighted) cl['topHightlightedCell'] = true;
    //   return cl;
    // }
  },
};
</script>

<style scoped>
.recommend-list {
  margin: 0;
  z-index: 3000;
  position: fixed;
  /* list-style-type: none; */
  text-align: left;
  -webkit-box-shadow: 0 2px 6px 0px rgb(0 0 0 / 32%);
  background-color: white;
  padding-top: 7px;
  padding-bottom: 7px;
}

.recommend-item {
  z-index: 3000;
  height: 30px;
  width: 100%;
  padding: 5px 10px 5px 10px;
}

.recommend-item:hover {
  background-color: #eaebee;
}
</style>
