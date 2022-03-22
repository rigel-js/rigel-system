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
        <div id="spreadsheet-container">
          <spreadsheet-view></spreadsheet-view>
        </div>
      </div>
      <div id="suggestion-container">
        <suggestion-view></suggestion-view>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
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
  mounted() {
    this.storeCurrentState();
  },
  methods: {
    ...mapActions(["storeCurrentState"]),
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
  min-height: 100%;
  /* min-width: 1680px; */
  /* min-height: 1050px; */
  /* display: flex; */
  flex-direction: column;
  font-family: DINMedium;
}

#header-container {
  width: 100%;
  height: 50px;
  line-height: 20px;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.87);
  /* border: 1px solid rgba(187, 187, 187, 100); */
  /* -webkit-box-shadow: 0 2px 6px 0px rgb(0 0 0 / 22%); */
}

#body-container {
  overflow: scroll;
  width: 100%;
  height: calc(100% - 55px);
  display: flex;
  flex-direction: row;
  position: absolute;
  /* border: 3px solid rgba(0, 0, 0, 0.87); */
  /* border: 1px solid rgba(187, 187, 187, 100); */
}

#extractor-container {
  flex: 1 1 600px;
  display: flex;
  flex-direction: column;
  margin: 10px 15px 10px 15px;
  width: 60%;
}

#relation-container {
  flex: 1 1 100px;
  margin-bottom: 15px;
  border: 3px solid rgba(0, 0, 0, 0.87);
}

#spreadsheet-container {
  flex: 1 1 100px;
  border: 3px solid rgba(0, 0, 0, 0.87);
}

#suggestion-container {
  flex: 1 1 500px;
  margin: 10px 15px 10px 15px;
  border: 3px solid rgba(0, 0, 0, 0.87);
}

.view {
  padding: 15px 30px;
}

.view-title {
  font-size: 22px;
  background-color: transparent;
  color: white;
  /* font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"; */
  font-family: DINAlternate-Bold;
  /* margin: 10px 0; */
  text-align: left;
  width: 150px;
  min-width: 150px;
  padding-left: 15px;
  display: inline-block;
  height: 36px;
  line-height: 32px;
  z-index: 5;
  position: relative;
}

.title-bg {
  /* background-color: rgba(0, 0, 0, 0.87); */
  border-top:36px solid rgba(0, 0, 0, 0.87);
  border-left:0px solid transparent;
  border-right:20px solid transparent;
  width: 170px;
  position: absolute;
  -webkit-transform: translateZ(0);
 }

.applypanel {
  background-color: #fff;
}

.applypanel :hover{
  background-color: #eaebee !important;
}

.applypanelcontent {
  border: 1px solid #eaebee;
  padding: 7px 7px 7px 7px;
  width: 100%;
  height: 100%;
  transform: translateX(-2px);
}

.applypaneltext {
  display: inline-block;
}
.applypanelicon {
  display: inline-block;
  margin-right: 5px;
  margin-left: 2px;
}

.ant-popover-message {
  padding-bottom: 0 !important;
}

.ant-popover-buttons {
  display: none !important;
}

/* .ant-btn{
  margin-left: 5px !important;
  margin-right: 5px !important;
} */

.ant-popover-message-title {
  padding-left: 0 !important;
}

.ant-tabs-bottom .ant-tabs-bottom-bar {
  margin-top: 0 !important;
}

@font-face{
  font-family: 'DINAlternate-Bold';
  src: url("./assets/fonts/DINAlternate-Bold.ttf");
}

@font-face{
  font-family: 'DINMedium';
  src: url("./assets/fonts/DINMedium.ttf");
}
</style>
