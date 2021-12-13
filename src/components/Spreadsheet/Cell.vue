<template>
  <div
    class="cell"
    :title="value"
    :contenteditable="editable"
    :draggable="draggable"
    @dragstart="dragHandler"
    @drop="dropHandler"
    @dragover="allowDrop"
    @input="inputHandler"
    :style="{ 'background-color': cellColor }"
  >
    {{ initValue }}
  </div>
</template>

<script>
export default {
  name: "SpreadsheetCell",
  props: {
    initValue: {
      required: true,
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
      value: this.initValue,
    };
  },
  methods: {
    dragHandler(event) {
      event.dataTransfer.setData("dragValue", event.target.innerText);
      event.dataTransfer.setData("type", "cell");
    },

    allowDrop(event) {
      if (this.editable) {
        event.preventDefault();
        if(event.offsetX < 10) {  //左边沿
          this.$emit("left-hover");
        } else {  //上边沿
          this.$emit("upper-hover");
        }
      }
    },

    dropHandler(event) {
      if (this.editable) {
        event.preventDefault();
        if(event.dataTransfer.getData("type") === "cell"){
          event.target.innerText = event.dataTransfer.getData("dragValue");
          this.value = event.target.innerText;
          this.$emit("cell-change", this.value);
        } else {
          console.log("attr!");
          console.log(event.offsetX, event.offsetY);
          let attr = JSON.parse(event.dataTransfer.getData("info"));
          if(event.offsetX < 10) {  //左边沿
            this.$emit("left-change", attr);
          } else {  //上边沿
            this.$emit("upper-change", attr);
          }
        }
      }
    },

    inputHandler(event) {
      this.value = event.target.innerText;
      this.$emit("cell-change", this.value);
    },
  },
};
</script>
