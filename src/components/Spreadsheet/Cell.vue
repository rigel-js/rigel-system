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
    :style="{ 'background-color': cellColor}"
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
      default: 'white'
    }
  },
  data() {
    return {
      value: this.initValue,
    };
  },
  methods: {
    dragHandler(event) {
      event.dataTransfer.setData("dragValue", event.target.innerText);
    },

    allowDrop(event) {
      if (this.editable) event.preventDefault();
    },

    dropHandler(event) {
      if (this.editable) {
        event.preventDefault();
        event.target.innerText = event.dataTransfer.getData("dragValue");
        this.value = event.target.innerText;
        this.$emit("cell-change", this.value);
      }
    },

    inputHandler(event) {
      this.value = event.target.innerText;
      this.$emit("cell-change", this.value);
    },
  },
};
</script>
