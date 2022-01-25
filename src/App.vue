<template>
  <div id="app">
    <div id="header-container">
      <header-view></header-view>
    </div>
    <div id="body-container">
      <div id="extractor-container">
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
  </div>
</template>

<script>
import HeaderView from "./components/HeaderView.vue";
import RelationView from "./components/RelationView.vue";
import SpreadsheetView from "./components/SpreadsheetView.vue";
import SuggestionView from "./components/SuggestionView.vue";

export default {
  name: "App",
  components: {
    HeaderView,
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
  /* min-width: 1680px; */
  /* min-height: 1050px; */
  display: flex;
  flex-direction: column;
  background: #eee;
}

#header-container {
  width: 100%;
  height: 50px;
  line-height: 20px;
  display: flex;
  flex-direction: column;
  background-color: rgba(245, 245, 245, 100);
  border: 1px solid rgba(187, 187, 187, 100);
}

#body-container {
  width: 100%;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: row;
  background-color: rgba(247, 247, 247, 100);
  text-align: center;
  border: 1px solid rgba(187, 187, 187, 100);
}

#extractor-container {
  flex: 0 0 500px;
  display: flex;
  flex-direction: column;
  margin: 15px 0 15px 15px;
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
}

#suggestion-container {
  flex: 0 0 450px;
  margin: 15px;
}

.view {
  padding: 15px 30px;
}

.view-title {
  font: bold 28px/36px Times;
  margin: 10px 0;
}
</style>
