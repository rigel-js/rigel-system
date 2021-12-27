<template>
  <div class="view spreadsheet-view">
    <div class="view-title">Target Table</div>
    <div class="spreadsheet-container">
      <spreadsheet
        name="targetTable"
        :initRowNum="50"
        :initColNum="8"
        :editable="true"
        :table="this.suggestedTable"
        :key="JSON.stringify(this.suggestedTable)"
      ></spreadsheet>
    </div>
  </div>
</template>

<script>
import Spreadsheet from "./Spreadsheet/Index.vue";
import { mapActions, mapState } from "vuex";

export default {
  name: "SpreadsheetView",
  computed: {
    ...mapState(["suggestedTable"]),
  },
  methods: {
    onInput(event) {
      console.log(event);
    },
  },
  components: {
    Spreadsheet,
  },
};
</script>

<style scoped>
.spreadsheet-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.spreadsheet-container {
  height: calc(100% - 76px);
  overflow: scroll;
  margin: 20px 0 5px 0;
}

.spreadsheet-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
</style>
