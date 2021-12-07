<template>
  <div id="app">
    <div id="extractor-container">
      <div id="dataset-container">
        <dataset-view></dataset-view>
      </div>
      <div id="relation-container">
        <relation-view></relation-view>
      </div>
    </div>
    <div id="spreadsheet-container">
      <spreadsheet-view></spreadsheet-view>
    </div>
    <div id="suggestion-container">
      <suggestion-view></suggestion-view>
    </div>
  </div>
</template>

<script>
import DatasetView from "./components/DatasetView.vue";
import RelationView from "./components/RelationView.vue";
import SpreadsheetView from "./components/SpreadsheetView.vue";
import SuggestionView from "./components/SuggestionView.vue";

export default {
  name: "App",
  components: {
    DatasetView,
    RelationView,
    SpreadsheetView,
    SuggestionView,
  },
};
</script>

<style>
body {
  margin: 0px;
  width: 100vw;
  height: 100vh;
}

#app {
  width: 100%;
  height: 100%;
  min-width: 1680px;
  min-height: 1050px;
  display: flex;
  flex-direction: row;
  background: #e0e0e0;
  text-align: center;
}

#extractor-container {
  flex: 0 0 500px;
  display: flex;
  flex-direction: column;
  margin: 15px 0 15px 15px;
  background: #fff;
}

#extractor-container #dataset-container {
  flex: 0 0 525px;
}

#extractor-container #relation-container {
  flex: 1 1;
  overflow: hidden;
}

#spreadsheet-container {
  flex: 1 1;
  margin: 15px 0 15px 15px;
  background: #fff;
}

#suggestion-container {
  flex: 0 0 450px;
  margin: 15px;
  background: #fff;
}

.view {
  padding: 15px 30px;
}

.view-title {
  font: bold 28px/36px Times;
  margin: 10px 0;
}
</style>
