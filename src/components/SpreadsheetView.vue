<template>
  <div class="view spreadsheet-view">
    <div class="view-title">Target Table</div>
    <div class="spreadsheet-container">
      <spreadsheet
        name="targetTable"
        :initRowNum="14"
        :initColNum="8"
        :editable="true"
        :table="this.currentTable"
        :key="JSON.stringify(this.currentTable)"
      ></spreadsheet>
    </div>
    <div class="specmenu">
      <div class="speccomponent">
        <div class="spectitle">Row header:</div>
        <div
          class="specinput"
          id="rowinput"
          @dragover="dragoverHandler"
          @drop="dropHandler"
        >
          <div
            v-for="(item, index) in this.row_header"
            :key="`row_${index}`"
            :id="`spec_row_${index}_${JSON.stringify(item)}`"
            class="specitem"
            :draggable="true"
            :data-info="JSON.stringify(item)"
            @dragstart="dragstartHandler"
          >
            <div v-if="index != 0" class="specoperator">×</div>
            <div class="spectext">
              {{
                item.data
                  ? `${item.data}.${item.attribute}`
                  : `${item.attribute}`
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="speccomponent">
        <div class="spectitle">Column header:</div>
        <div
          class="specinput"
          id="columninput"
          @dragover="dragoverHandler"
          @drop="dropHandler"
        >
          <div
            v-for="(item, index) in this.column_header"
            :key="`column_${index}`"
            :id="`spec_column_${index}_${JSON.stringify(item)}`"
            class="specitem"
            :draggable="true"
            :data-info="JSON.stringify(item)"
            @dragstart="dragstartHandler"
          >
            <div v-if="index != 0" class="specoperator">×</div>
            <div class="spectext">
              {{
                item.data
                  ? `${item.data}.${item.attribute}`
                  : `${item.attribute}`
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="speccomponent">
        <div class="spectitle">Body:</div>
        <div
          class="specinput"
          id="bodyinput"
          @dragover="dragoverHandler"
          @drop="dropHandler"
        >
          <div
            v-for="(item, index) in this.body"
            :key="`body_${index}`"
            :id="`spec_body_${index}_${JSON.stringify(item)}`"
            class="specitem"
            :draggable="true"
            :data-info="JSON.stringify(item)"
            @dragstart="dragstartHandler"
          >
            <div v-if="index != 0" class="specoperator">+</div>
            <div class="spectext">
              {{
                item.data
                  ? `${item.data}.${item.attribute}`
                  : `${item.attribute}`
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="spectoolbar">
        <!-- <a-button type="primary" class="specbutton" @click="applyHandler"
          >Apply</a-button
        > -->
        <a-button class="specbutton" @click="resetHandler">Reset</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import Spreadsheet from "./Spreadsheet/Index.vue";
import { mapActions, mapState } from "vuex";
import { transform } from "rigel-tools";
import Utils from "@/utils.js";

export default {
  name: "SpreadsheetView",
  // data() {
  //   return {
  //     row_header: [],
  //     // row_header: [
  //     //   {
  //     //     attribute: "state",
  //     //     color: "rgb(243,26,244,0.4)",
  //     //     data: "crime",
  //     //     strName: {
  //     //       attribute: "state",
  //     //       data: "crime",
  //     //       operator: "attr",
  //     //     },
  //     //     valueList: ["Alabama", "Alaska"],
  //     //   },
  //     // ],
  //     column_header: [],
  //     body: [],
  //   };
  // },
  computed: {
    ...mapState(["currentTable", "rawRelations", "attrInfo", "newSpec", "row_header", "column_header", "body"]),
  },
  watch: {
    newSpec(val, oldval) {
      console.log(this.newSpec);
      if (val) {
        // this.row_header = Utils.specObj2List(val["row_header"]);
        // this.column_header = Utils.specObj2List(val["column_header"]);
        // this.body = Utils.specObj2List(val["body"]);
        this.setSpec({
          "row_header": Utils.specObj2List(val["row_header"]),
          "column_header": Utils.specObj2List(val["column_header"]),
          "body": Utils.specObj2List(val["body"])
        });
        this.storeNewSpec(null);
        try{
          let alterSpec = Utils.genAlterSpec(this.row_header, this.column_header, this.body);
          this.storeAlterSpecList(alterSpec);
          let exploreSpec = Utils.genExploreSpec(this.row_header, this.column_header, this.body, this.attrInfo);
          this.storeSuggestion(exploreSpec);
        } catch(err) {
          console.log(err.message);
          this.$message.error(err.message);
        }
      }
    },
    row_header(val, oldval) {
      this.applyHandler();
    },
    column_header(val, oldval) {
      this.applyHandler();
    },
    body(val, oldval) {
      this.applyHandler();
    }
  },
  methods: {
    ...mapActions([
      "storeCurrentTable",
      "storeAlterSpecList",
      "storeSuggestion",
      "storeNewSpec",
      "setSpec",
    ]),
    onInput(event) {
      console.log(event);
    },
    dragstartHandler(event) {
      // event.dataTransfer.setData("info", event.target.dataset.info);
      sessionStorage.setItem("info", event.target.dataset.info);
      sessionStorage.setItem("type", "spec");
      sessionStorage.setItem("id", event.target.id);
    },
    dragoverHandler(event) {
      let type = sessionStorage.getItem("type");
      if (type == "spec" || type == "attr") {
        event.preventDefault();
      } else {
        return;
      }
      let pre = sessionStorage.getItem("info"),
        current = event.target;
      let preItem = JSON.parse(pre);
      let preNode = document.getElementById(sessionStorage.getItem("id"));
      if (!preNode || preNode == current) return;

      let sourceList, targetList, sourceIndex, targetIndex;
      console.log(type);

      if (type == "attr") {
        // sessionStorage.setItem("type", "spec");
      } else {
        sourceList = this.checkListType(preNode.parentNode);
        sourceIndex = this._index(preNode);
      }

      if (current.className == "specinput") {
        if (
          current.lastChild &&
          event.clientX <= current.lastChild.getBoundingClientRect().right
        ) {
          return;
        }
        targetList = this.checkListType(current);
        targetIndex =
          sourceList == targetList ? targetList.length - 1 : targetList.length;
      } else {
        targetList = this.checkListType(current.parentNode);
        targetIndex = this._index(current);
      }

      console.log(sourceList, targetList);
      if (type == "attr") {
        sessionStorage.setItem("type", "spec");
        if (current.className == "specinput") {
          targetList.push(preItem);
        } else {
          targetList.splice(targetIndex, 0, preItem);
        }
      } else {
        if (current.className == "specinput") {
          sourceList.splice(sourceIndex, 1);
          targetList.push(preItem);
        } else {
          sourceList.splice(sourceIndex, 1);
          targetList.splice(targetIndex, 0, preItem);
        }
      }

      this.$forceUpdate();
      let listId =
        current.className == "specinput"
          ? this.listToId(current)
          : this.listToId(current.parentNode);
      let newId = `spec_${listId}_${targetIndex}_${pre}`;
      sessionStorage.setItem("id", newId);
      console.log(newId);
    },
    dropHandler(event) {
      event.preventDefault();
      console.log("drop");
      let spec = Utils.genSpec(this.row_header, this.column_header, this.body);
      let sch = {
        data: this.rawRelations,
        target_table: [spec],
      };
      console.log(sch);
      try {
        let res = transform(sch)[0];
        console.log(res);
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < res[i].length; j++) {
            if (res[i][j]) {
              let tmp = {};
              tmp.source = res[i][j].source;
              tmp.value = res[i][j].value ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        console.log(res);
        this.storeCurrentTable(res);
      } catch (err) {
        this.$message.error("Illegal specification!");
      }
    },
    _index(el) {
      var index = 0;
      if (!el || !el.parentNode) {
        return -1;
      }
      while (el && (el = el.previousElementSibling)) {
        index++;
      }
      return index;
    },
    checkListType(el) {
      let id = el.id;
      if (id == "rowinput") {
        return this.row_header;
      } else if (id == "columninput") {
        return this.column_header;
      } else if (id == "bodyinput") {
        return this.body;
      }
    },
    listToId(el) {
      let id = el.id;
      if (id == "rowinput") {
        return "row";
      } else if (id == "columninput") {
        return "column";
      } else if (id == "bodyinput") {
        return "body";
      }
    },
    resetHandler() {
      // this.row_header = [];
      // this.column_header = [];
      // this.body = [];
      this.setSpec({
        "row_header": [],
        "column_header": [],
        "body": []
      });
      this.$forceUpdate();
    },
    applyHandler() {
      try{
        let alterSpec = Utils.genAlterSpec(this.row_header, this.column_header, this.body);
        this.storeAlterSpecList(alterSpec);
        let exploreSpec = Utils.genExploreSpec(this.row_header, this.column_header, this.body, this.attrInfo);
        this.storeSuggestion(exploreSpec);
      } catch(err) {
        console.log(err.message);
        this.$message.error(err.message);
      }
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
  height: 60%;
  min-width: 500px;
  overflow: scroll;
  margin: 20px 0 5px 0;
}

.spreadsheet-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.specmenu {
  text-align: left;
  margin-top: 50px;
  vertical-align: center;
  overflow: scroll;
  height: 40%;
}

.specmenu::-webkit-scrollbar {
  display: none;
}

.speccomponent {
  margin-bottom: 21px;
}

.spectitle {
  display: inline-block;
  margin-right: 10px;
  /* margin-bottom: 15px; */
  height: 27px;
  width: 130px;
  text-align: right;
}

.specinput {
  background: white;
  display: inline-block;
  min-height: 28px;
  width: 350px;
  margin-bottom: -9px;
  border-radius: 4px;
  border: 1px solid rgba(187, 187, 187, 100);
}

.specinput::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.specitem {
  height: 20px;
  margin: 2px auto 2px auto;
  padding-left: 3px;
  padding-right: 3px;
  display: inline-block;
}

.specoperator {
  user-select: none;
  pointer-events: none;
  display: inline-block;
  margin: 2px 4px 2px auto;
}

.spectext {
  user-select: none;
  pointer-events: none;
  display: inline-block;
  border-radius: 4px;
  border: 1px solid;
  padding: 0 2px 0 2px;
}

.specbutton {
  width: 52px;
  height: 26px;
  padding: 0px 2px 0px 2px;
  margin: auto 7px auto 7px;
  text-align: center;
  display: inline-block;
}

.spectoolbar {
  vertical-align: center;
  text-align: center;
  margin: 7px auto 50px;
}
</style>
