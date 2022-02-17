<template>
  <div
    class="cell"
    :title="this.cellValue"
    :contenteditable="editable"
    :draggable="draggable"
    :data-info="JSON.stringify(this.cellValue)"
    @dragstart="dragHandler"
    @drop="dropHandler"
    @dragover="allowDrop"
    @dragleave="dragLeaveHandler"
    @blur="inputHandler"
    :style="{ 'background-color': cellColor }"
  >
    {{
      this.realValue
    }}
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "SpreadsheetCell",
  props: {
    value: Object,
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
  data() {
    return {
      cellValue: "",
      realValue: "",
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

    inputHandler(event) {
      console.log("input");
      let info = {
        value: event.target.innerText,
        isDrag: false,
      };
      this.$emit("cell-change", info);
    },

    dragLeaveHandler(event) {
      this.$emit("drag-leave");
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
