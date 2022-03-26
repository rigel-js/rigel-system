<template>
  <div class="suggestion-view" id="suggestion-view">
    <div class="view-title" id="suggestion-title">Suggestions</div>
    <div class="suggestion-container" id="suggestion-container2">
      <div v-if="this.partialSpecSuggestion" class="suggestion-unit">
        <div class="suggestionTitle">Disambiguate user interactions.</div>
        <Newcollapse :initial="0">
          <Newcollapsepanel
            v-for="(item, index) in this.partialSpecSuggestion"
            :key="index"
            :name="index"
            :header="`${item.itemDescription} belongs to ${item.source}`"
          >
            <div
              v-for="(partialSpec, index2) in item.partialSpecList"
              :key="index2"
              class="applypanel"
              :class="{'firsthover': index2 == 0}"
              @click="applyPartialSpec(partialSpec)"
              @mouseenter="previewPartialSpec($event, partialSpec)"
              @mouseleave="restorePreview"
            >
              <div class="applypanelcontent">
                <a-icon type="bulb" class="icon applypanelicon"/>
                <span class="applypaneltext"> {{ partialSpec.description }} </span>
              </div>
            </div>
          </Newcollapsepanel>
        </Newcollapse>
      </div>
      <div v-else-if="deleteSpecSuggestion" class="suggestion-unit">
        <div class="suggestionTitle">
          Choose recommendations based on your interactions.
        </div>
        <div
          v-for="(item, index) in deleteSpecSuggestion"
          :key="index"
          class="applypanel"
          @click="deletePartialSpec(item)"
        >
          <div class="applypanelcontent">
            <a-icon type="bulb" class="icon applypanelicon"/>
            <span class="applypaneltext"> {{ item.description }} </span>
          </div>
        </div>
      </div>
      <div v-else>
        <div
          v-if="this.alterSpecList.length == 0 && this.suggestions.length == 0"
          class="suggestion-empty"
        >
          <a-empty style="padding-top: 100px" />
        </div>
        <div class="suggestion-unit" v-if="this.alterSpecList.length > 0">
          <div class="suggestionTitle">
            Alternatives
          </div>
          <div class="alter-unit">
            <div
              v-for="(suggestion, i) in this.alterSpecList"
              :key="`top${i}`"
              class="applypanel"
              @click="applySpec(suggestion)"
              @mouseenter="previewSpec(suggestion)"
              @mouseleave="restorePreview"
            >
              <div class="applypanelcontent">
                <a-icon type="bulb" class="icon applypanelicon"/>
                <span class="applypaneltext"> {{ suggestion.description }} </span>
              </div>
            </div>
          </div>
        </div>
        <div class="suggestion-unit" v-if="this.suggestions.length > 0">
          <div class="suggestionTitle">Variations</div>
          <div class="variation-unit">
            <Varunit :content="this.suggestions" :level="0"/>
          </div>
        </div>
      </div>
    </div>
    <!-- preview -->
    <div class="previewwindow" id="previewwindow">
      <div class="previewTitle">Preview</div> 
      <spreadsheet 
        name="preview" 
        :table="previewTable" 
        :key="JSON.stringify(this.previewTable)" 
        :editable="false" 
        :contentDraggable="false"
      >
      </spreadsheet>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { transform } from "rigel-tools";
import Varunit from "./Varunit/Index.vue";
import Utils from "@/utils.js";
import Spreadsheet from "./Spreadsheet/Index.vue";
// import test from "./test/Index.vue";

export default {
  name: "SuggestionView",
  data() {
    return {
      // testcontent: [
      //   {
      //     add: "union(a,b)", // string
      //     list: [
      //       {
      //         // spec数组
      //         row_header: null,
      //         column_header: null,
      //         body: null,
      //         description: "(a), (b) => (c)",
      //       },
      //     ],
      //   },
      // ],
      activeKeys: [],
    };
  },
  computed: mapState([
    "relations",
    "suggestions",
    "rawRelations",
    "alterSpecList",
    "partialSpecSuggestion",
    "deleteSpecSuggestion",
    "row_header",
    "column_header",
    "body",
    "currentActiveGrid",
    "rowInfo",
    "colInfo",
    "reapplyPartialSpec",
    "currentTable",
    "previewTable",
  ]),
  watch: {
    partialSpecSuggestion(val, oldval) {
      console.log(val);
      if(val && val.length > 0) {
          let partialSpec = val[0].partialSpecList[0];
          this.previewPartialSpec(null, partialSpec);
      } else {
        this.storePreviewTable(undefined);
      }
    },
    reapplyPartialSpec(val, oldval) {
      if(val) {
        console.log("reapply");
        this.applyPartialSpec(this.partialSpecSuggestion[0].partialSpecList[0]);
        this.storeReapplyPartialSpec(false);
      }
    }
  },
  mounted() {
    let el = document.createElement("div");
    el.className = "title-bg";
    let tmp1 = document.getElementById("suggestion-view"), tmp2 = document.getElementById("body-container");
    let rect1 = tmp1.getBoundingClientRect(), rect2 = tmp2.getBoundingClientRect();
    // console.log(rect1, rect2);
    el.style.top = `${rect1.top - rect2.top}px`;
    el.style.left = `${rect1.left - rect2.left}px`;
    tmp1.appendChild(el);

    let el2 = document.getElementById("suggestion-container");
    let el3 = document.getElementById("suggestion-title");
    let el4 = document.getElementById("suggestion-container2");
    let el5 = document.getElementById("previewwindow");
    console.log(el2,el3,el4,el5);
    let height = el2.getBoundingClientRect().height - el3.getBoundingClientRect().height - el4.getBoundingClientRect().height;
    height -= 66; //margin
    console.log(el4.getBoundingClientRect().height)
    el5.style.height = `${height}px`;
    el5.style.width = `${el2.getBoundingClientRect().width - 8}px`;
    console.log(el5.style.height);
  },
  methods: {
    ...mapActions([
      "storeCurrentTable",
      "storePartialSpecSuggestion",
      "storeDeleteSpecSuggestion",
      "storeRowInfo",
      "storeColInfo",
      "storeCurrentState",
      "storeAttrInfo",
      "storePreviewTable",
      "storeReapplyPartialSpec",
      "storeGenRecommendation",
      "setSpec",
    ]),
    applySpec(spec) {
      let sch = {
        data: this.rawRelations,
        target_table: [spec],
      };
      console.log(sch);
      try {
        let res = transform(sch)[0];
        // console.log(res);
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < res[i].length; j++) {
            if (res[i][j]) {
              let tmp = {};
              tmp.source = res[i][j].source;
              tmp.value = typeof(res[i][j].value) != "undefined" ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        let rowlen = Utils.specObj2List(spec.row_header).length;
        let collen = Utils.specObj2List(spec.column_header).length;
        this.storeRowInfo({
          row: this.rowInfo.row,
          column: this.rowInfo.column,
          len: rowlen,
        });
        this.storeColInfo({
          row: this.colInfo.row,
          column: this.rowInfo.column + (rowlen == 0 ? 1 : rowlen),
          len: collen,
        });
        console.log(res);
        console.log(this.rowInfo, this.colInfo);
        let table = Utils.mapTable(res, this.rowInfo, this.colInfo);
        console.log(table);
        this.storeCurrentTable(table);
        this.setSpec({
          row_header: Utils.specObj2List(spec["row_header"]),
          column_header: Utils.specObj2List(spec["column_header"]),
          body: Utils.specObj2List(spec["body"]),
        });
        this.storeGenRecommendation(true);
      } catch (err) {
        this.$message.error("Illegal specification!");
        throw err;
      }
    },
    applyPartialSpec(partialSpec) {
      let derivedAttr = null, type = "";

      if (partialSpec.row_header) {
        if (!this.rowInfo.len) {
          if (!this.colInfo.len) {
            this.storeRowInfo({
              row: this.currentActiveGrid.row ? this.currentActiveGrid.row : 1,
              column: this.currentActiveGrid.column,
              len: 1,
            });
            this.storeColInfo({
              row: this.currentActiveGrid.row
                ? this.currentActiveGrid.row - 1
                : 0,
              column: this.currentActiveGrid.column + 1,
              len: 0,
            });
          } else {
            // 下面两行是冲突的时候取舍的策略 先这么写 如果后面觉得不合适再改
            let row =
              this.currentActiveGrid.row < this.colInfo.row + this.colInfo.len
                ? this.colInfo.row + this.colInfo.len
                : this.currentActiveGrid.row;
            let column =
              this.currentActiveGrid.column < this.colInfo.column
                ? this.currentActiveGrid.column
                : this.colInfo.column - 1;
            this.storeRowInfo({
              row,
              column,
              len: 1,
            });
          }
          this.row_header.push(partialSpec.row_header);
        } else {
          if (this.currentActiveGrid.column < this.rowInfo.column) {
            this.storeRowInfo({
              row: this.rowInfo.row,
              column: this.rowInfo.column - 1,
              len: this.rowInfo.len + 1,
            });
            this.row_header.splice(0, 0, partialSpec.row_header);
          } else if(this.currentActiveGrid.column >= this.rowInfo.column + this.rowInfo.len){
            this.storeRowInfo({
              row: this.rowInfo.row,
              column: this.rowInfo.column,
              len: this.rowInfo.len + 1,
            });
            this.row_header.push(partialSpec.row_header);
            if (
              this.colInfo.column &&
              this.rowInfo.column + this.rowInfo.len > this.colInfo.column
            ) {
              this.storeColInfo({
                row: this.colInfo.row,
                column: this.colInfo.column + 1,
                len: this.colInfo.len,
              });
            }
          } else { // 推荐union
            let attr1 = this.row_header[this.currentActiveGrid.column - this.rowInfo.column];
            let attr2 = partialSpec.row_header;
            // console.log(attr1, attr2);
            let newAttr = {
              operator: "union",
              parameters: [attr1, attr2],
            };
            this.row_header[this.currentActiveGrid.column - this.rowInfo.column] = newAttr;

            derivedAttr = newAttr;
            type = "row_header";
          }
        }
      }

      if (partialSpec.column_header) {
        if (!this.colInfo.len) {
          if (!this.rowInfo.len) {
            this.storeColInfo({
              row: this.currentActiveGrid.row,
              column: this.currentActiveGrid.column
                ? this.currentActiveGrid.column
                : 1,
              len: 1,
            });
            this.storeRowInfo({
              row: this.currentActiveGrid.row + 1,
              column: this.currentActiveGrid.column
                ? this.currentActiveGrid.column - 1
                : 0,
              len: 0,
            });
          } else {
            // 下面两行是冲突的时候取舍的策略 先这么写 如果后面觉得不合适再改
            let column =
              this.currentActiveGrid.column <
              this.rowInfo.column + this.rowInfo.len
                ? this.rowInfo.column + this.rowInfo.len
                : this.currentActiveGrid.column;
            let row =
              this.currentActiveGrid.row < this.rowInfo.row
                ? this.currentActiveGrid.row
                : this.rowInfo.row - 1;
            this.storeColInfo({
              row,
              column,
              len: 1,
            });
          }
          this.column_header.push(partialSpec.column_header);
        } else {
          if (this.currentActiveGrid.row < this.colInfo.row) {
            this.storeColInfo({
              row: this.colInfo.row - 1,
              column: this.colInfo.column,
              len: this.colInfo.len + 1,
            });
            this.column_header.splice(0, 0, partialSpec.column_header);
          } else if(this.currentActiveGrid.row >= this.colInfo.row + this.colInfo.len) {
            this.storeColInfo({
              row: this.colInfo.row,
              column: this.colInfo.column,
              len: this.colInfo.len + 1,
            });
            this.column_header.push(partialSpec.column_header);
            if (this.colInfo.row + this.colInfo.len > this.rowInfo.row) {
              this.storeRowInfo({
                row: this.rowInfo.row + 1,
                column: this.rowInfo.column,
                len: this.rowInfo.len,
              });
            }
          } else {
            let attr1 = this.column_header[this.currentActiveGrid.row - this.colInfo.row];
            let attr2 = partialSpec.column_header;
            // console.log(attr1, attr2);
            let newAttr = {
              operator: "union",
              parameters: [attr1, attr2],
            };
            this.column_header[this.currentActiveGrid.row - this.colInfo.row] = newAttr;

            derivedAttr = newAttr;
            type = "column_header";
          }
        }
      }

      if (partialSpec.body) {
        this.body.push(partialSpec.body);
      }

      let spec = Utils.genSpec(this.row_header, this.column_header, this.body);
      console.log(spec);

      let sch = {
        data: this.rawRelations,
        target_table: [spec],
      };
      console.log(sch);
      try {
        let res = transform(sch)[0];
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < res[i].length; j++) {
            if (res[i][j]) {
              let tmp = {};
              tmp.source = res[i][j].source;
              tmp.value = typeof(res[i][j].value) != "undefined" ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        console.log(res);
        console.log(this.rowInfo, this.colInfo);
        let table = Utils.mapTable(res, this.rowInfo, this.colInfo);
        console.log(table);

        this.storeCurrentTable(table);

        if(derivedAttr) {
          let color = Utils.genRandomColor(1)[0];
          let valueList = [];
          if(type == "row_header") {
            for(let i = 0; i < table.length; i++) {
              if(table[i][this.currentActiveGrid.column - this.rowInfo.column]) {
                let tmp = table[i][this.currentActiveGrid.column - this.rowInfo.column];
                valueList.push(tmp.value ? tmp.value : tmp);
              }
            }
          } else {
            for(let i = 0; i<table[this.currentActiveGrid.row - this.colInfo.row].length; i++) {
              if(table[this.currentActiveGrid.row - this.colInfo.row][i]) {
                let tmp = table[this.currentActiveGrid.row - this.colInfo.row][i];
                valueList.push(tmp.value ? tmp.value : tmp);
              }
            }
          }
          let relationAttr = {
            strName: derivedAttr,
            attribute: Utils.calString(derivedAttr),
            color: color,
            valueList: Utils.unique(valueList),
            isCategorical: Utils.isCategorical(valueList),
          };
          this.storeAttrInfo(relationAttr);
        }
      } catch (err) {
        console.log(err);
        this.$message.error("Illegal specification!");
      }
      
      this.storePartialSpecSuggestion(null);
      this.storePreviewTable(undefined);
      this.storeGenRecommendation(true);
    },
    deletePartialSpec(partialSpec) {
      let deleteRow = this.currentActiveGrid.row,
        deleteColumn = this.currentActiveGrid.column;
      if (partialSpec.row_header) {
        if(partialSpec.isFilter) {
          this.row_header.splice(deleteColumn - this.rowInfo.column, 1, partialSpec.row_header);
        } else {
          this.row_header.splice(deleteColumn - this.rowInfo.column, 1);
          if (this.rowInfo.len > 1) {
            this.storeRowInfo({
              row: this.rowInfo.row,
              column: this.rowInfo.column,
              len: this.rowInfo.len - 1,
            });
          } else {
            this.storeRowInfo({});
          }
        }
      } else if (partialSpec.column_header) {
        if(partialSpec.isFilter) {
          this.column_header.splice(deleteRow - this.colInfo.row, 1, partialSpec.column_header);
        } else {
          this.column_header.splice(deleteRow - this.colInfo.row, 1);
          if (this.colInfo.len > 1) {
            this.storeColInfo({
              row: this.colInfo.row,
              column: this.colInfo.column,
              len: this.colInfo.len - 1,
            });
          } else {
            this.storeColInfo({});
          }
        }
      } else {
        for (let i = 0; i < this.body.length; i++) {
          if (
            this.body[i].data == partialSpec.body.data &&
            this.body[i].attribute == partialSpec.body.attribute
          ) {
            this.body.splice(i, 1);
            break;
          }
        }
      }
      
      let spec = Utils.genSpec(this.row_header, this.column_header, this.body);
      console.log(spec);

      let sch = {
        data: this.rawRelations,
        target_table: [spec],
      };
      console.log(sch);
      try {
        let res = transform(sch)[0];
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < res[i].length; j++) {
            if (res[i][j]) {
              let tmp = {};
              tmp.source = res[i][j].source;
              tmp.value = typeof(res[i][j].value) != "undefined" ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        // console.log(res);
        let table = Utils.mapTable(res, this.rowInfo, this.colInfo);
        console.log(table);
        this.storeCurrentTable(table);
      } catch (err) {
        this.$message.error("Illegal specification!");
      }
      this.storeDeleteSpecSuggestion(null);
      this.storeGenRecommendation(true);
    },
    previewPartialSpec(e, partialSpec) {
      if (e) {
        let tmp = e.target;
        while(tmp) {
          tmp.className = tmp.className.replace(/firsthover/, "");
          tmp = tmp.previousSibling;
        }
      }
      console.log(this.currentTable);
      let row_header = Utils.deepClone(this.row_header);
      let column_header = Utils.deepClone(this.column_header);
      let body = Utils.deepClone(this.body);
      if (partialSpec.row_header) {
        if (!this.rowInfo.len) {
          row_header.push(partialSpec.row_header);
        } else {
          if (this.currentActiveGrid.column < this.rowInfo.column) {
            row_header.splice(0, 0, partialSpec.row_header);
          } else if(this.currentActiveGrid.column >= this.rowInfo.column + this.rowInfo.len){
            row_header.push(partialSpec.row_header);
          } else { // 推荐union
            let attr1 = row_header[this.currentActiveGrid.column - this.rowInfo.column];
            let attr2 = partialSpec.row_header;
            // console.log(attr1, attr2);
            let newAttr = {
              operator: "union",
              parameters: [attr1, attr2],
            };
            row_header[this.currentActiveGrid.column - this.rowInfo.column] = newAttr;
          }
        }
      }

      if (partialSpec.column_header) {
        if (!this.colInfo.len) {
          column_header.push(partialSpec.column_header);
        } else {
          if (this.currentActiveGrid.row < this.colInfo.row) {
            column_header.splice(0, 0, partialSpec.column_header);
          } else if(this.currentActiveGrid.row >= this.colInfo.row + this.colInfo.len) {
            column_header.push(partialSpec.column_header);
          } else {
            let attr1 = column_header[this.currentActiveGrid.row - this.colInfo.row];
            let attr2 = partialSpec.column_header;
            // console.log(attr1, attr2);
            let newAttr = {
              operator: "union",
              parameters: [attr1, attr2],
            };
            column_header[this.currentActiveGrid.row - this.colInfo.row] = newAttr;
          }
        }
      }

      if (partialSpec.body) {
        body.push(partialSpec.body);
      }

      let spec = Utils.genSpec(row_header, column_header, body);
      console.log(spec);

      let sch = {
        data: this.rawRelations,
        target_table: [spec],
      };
      console.log(sch);
      try {
        let res = transform(sch)[0];
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < res[i].length; j++) {
            if (res[i][j]) {
              let tmp = {};
              tmp.source = res[i][j].source;
              tmp.value = typeof(res[i][j].value) != "undefined" ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        this.storePreviewTable(res);
      } catch(err) {
        this.$message.error("Illegal specification!");
        throw err;
      }
      console.log(this.currentTable);
    },
    previewSpec(spec) {
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
              tmp.value = typeof(res[i][j].value) != "undefined" ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        console.log(res);
        this.storePreviewTable(res);
      } catch (err) {
        this.$message.error("Illegal specification!");
        throw err;
      }
    },
    restorePreview() {
      this.storePreviewTable(undefined);
    }
  },
  components: {
    Spreadsheet,
    Varunit,
    // test
  },
};
</script>

<style>
.suggestion-view {
  width: 100%;
  height: 100%;
}

.suggestion-container {
  height: 500px;
  margin: 20px 0 10px 0;
  background: white;
  overflow-y: scroll;
}



.suggestion-container .ant-collapse {
  min-width: 0px;
  font: 400 18px/24px Times;
  text-align: left;
}

.suggestion-unit {
  margin: 25px 20px 40px 20px;
  border: 1px solid #eaebee;
  border-radius: 12px;
  overflow: hidden;
}

.alter-unit::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.alter-unit {
  min-height: 80px;
  overflow: scroll;
}

.alter-panel:hover {
  background-color: #d8d5d5;
}

.variation-unit {
  min-height: 80px;
  overflow: scroll;
}

.variation-unit::-webkit-scrollbar {
  display: none;
}

.suggestion-empty {
  margin: 25px 20px 25px 20px;
}

.suggestionTitle {
  font-size: 20px;
  padding: 4px 0 4px 10px;
  font-weight: bold;
  /* font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"; */
  font-family: DINAlternate-Bold;
  background-color: #eaebee;
}

.collapse-unit {
  margin: 5px 9px 5px 9px;
  width: calc(100% - 18px);
}

.suggestion-disambiguate {
  height: 90%;
  overflow: scroll;
}

.suggestion-disambiguate::-webkit-scrollbar {
  display: none;
}

.previewwindow {
  background-color: white;
  overflow: hidden;
  height: 0;
  flex-direction: column;
  width: 0;
}

.previewTitle {
  font-size: 20px;
  background-color: rgba(0, 0, 0, 0.87);
  color: white;
  /* font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"; */
  font-family: DINAlternate-Bold;
  padding-left: 15px;
  padding-top: 1px;
  height: 36px;
  line-height: 32px;
}

.firsthover {
  background-color: #eaebee !important;
}
</style>
