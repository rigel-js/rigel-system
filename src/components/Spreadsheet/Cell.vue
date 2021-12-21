<template>
  <div
    class="cell"
    :title="this.cellValue"
    :contenteditable="editable"
    :draggable="draggable"
    @dragstart="dragHandler"
    @drop="dropHandler"
    @dragover="allowDrop"
    @dragleave="dragLeaveHandler"
    @input="inputHandler"
    :style="{ 'background-color': cellColor }"
  >
    {{ this.cellValue }}
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "SpreadsheetCell",
  props: {
    value: {
      type: String,
      default: "",
    },
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
    };
  },
  created() {
    this.cellValue = this.value;
  },
  methods: {
    ...mapActions(["setDragSource"]),
    dragHandler(event) {
      event.dataTransfer.setData("dragValue", event.target.innerText);
      event.dataTransfer.setData("type", "cell");
      this.setDragSource(true);
    },

    allowDrop(event) {
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
      if (this.editable) {
        event.preventDefault();
        if (event.dataTransfer.getData("type") === "cell") {
          // event.target.innerText = event.dataTransfer.getData("dragValue");
          this.$emit("cell-change", event.dataTransfer.getData("dragValue"));
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
      this.value = event.target.innerText;
      this.$emit("cell-change", this.value);
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
