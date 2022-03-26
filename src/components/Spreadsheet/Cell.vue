<template>
  <div
    class="cell"
    :title="this.realValue"
    :draggable="draggable"
    :data-info="JSON.stringify(this.cellValue)"
    :id="givenId"
    @dragstart="dragHandler"
    @drop="dropHandler"
    @dragover="allowDrop"
    @dragleave="dragLeaveHandler"
    :class="{'text-bold': cellBold }"
    @click="clickHandler"
    @blur="blurHandler"
    @input="inputHandler"
    :contenteditable="editable && this.canedit"
    @keydown.up="keyUpHandler"
    @keydown.down="keyDownHandler"
    @keydown.enter="keyEnterHandler"
    :style="`color: ${color}`"
  >
    {{ this.realValue }}
    <div
      class="recommend-list"
      v-if="this.alterValue.length > 0"
      :style="{ left: left + 'px', top: top + 'px' }"
      :contenteditable="false"
    >
      <div
        v-for="(value, index) in this.alterValue"
        :key="index"
        class="recommend-item"
        @click="applyHandler(value)"
        :class="{ onselect: index == currentIndex }"
        @mouseenter="hoverHandler(index)"
      >
        {{ `${value.value} (${value.description})` }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Utils from "@/utils.js";
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
    cellBold: {
      type: Boolean,
      default: false,
    },
    givenId: String,
    color: String,
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
      currentIndex: 0,
    };
  },
  created() {
    this.$on("keyup", (e) => {
      if(e.keyCode == 40) {
        this.keyDownHandler();
      } else if(e.keyCode == 38) {
        this.keyUpHandler();
      }
    });
    this.cellValue = this.value;
    let tmp = this.cellValue;
    if (tmp) {
      if (tmp.value) {
        if (!tmp.value.lower) {
          this.realValue = String(Utils.toFix(tmp.value));
        } else if (tmp.value.isRightOpen == true) {
          this.realValue = `[${Utils.toFix(tmp.value.lower)}, ${Utils.toFix(tmp.value.upper)})`;
        } else {
          this.realValue = `[${Utils.toFix(tmp.value.lower)}, ${Utils.toFix(tmp.value.upper)}]`;
        }
      } else if (typeof tmp.value != "undefined") {
        this.realValue = "";
      } else {
        this.realValue = String(Utils.toFix(tmp));
      }
    } else {
      this.realValue = "";
    }
  },
  methods: {
    ...mapActions(["setDragSource"]),
    hoverHandler(index) {
      this.currentIndex = index;
    },
    keyDownHandler() {
      // console.log("down");
      if(this.currentIndex < this.alterValue.length - 1) {
        this.currentIndex += 1;
      }
      console.log(this.currentIndex, this.alterValue.length);
    },
    keyUpHandler() {
      // console.log("up");
      if(this.currentIndex) {
        this.currentIndex -= 1;
      }
      console.log(this.currentIndex, this.alterValue.length);
    },
    keyEnterHandler() {
      this.applyHandler(this.alterValue[this.currentIndex]);
    },
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
      if (!this.canedit) return;
      this.canedit = false;
      this.alterValue = [];
      let index = 0;
      for (; index < event.target.innerText.length; index++) {
        if (event.target.innerText[index] === "\n") {
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
      for (; index < event.target.innerText.length; index++) {
        if (event.target.innerText[index] === "\n") {
          break;
        }
      }
      this.recommendValue(event.target.innerText.substr(0, index));
      this.currentIndex = 0;
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
        return []; // 非字母开头的字符串不推荐
      }
      let res = [],
        res_no_capital = [];
      for (let i = 0; i < this.attrInfo.length; i++) {
        let valueList = Utils.unique(this.attrInfo[i].valueList);
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

    applyHandler(value) {
      this.canedit = false;
      this.alterValue = [];
      console.log("apply", value);
      let info = {
        value: value.value,
        isDrag: false,
        source: value.source,
      };
      this.$emit("cell-change", info);
    },

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

.onselect {
  background-color: #eaebee;
}

.text-bold {
  font-weight: bold;
}
</style>
