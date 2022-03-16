<template>
  <div class="view spreadsheet-view">
    <div
      style="display: flex; flex-direction: row; justify-content: space-between"
    >
      <div class="view-title">Target Table</div>
      <a-button class="rearrange-button" @click="rearrangeHandler">
        Rearrange
      </a-button>
    </div>
    <div class="spreadsheet-container">
      <spreadsheet
        name="targetTable"
        :initRowNum="14"
        :initColNum="5"
        :editable="true"
        :table="this.currentTable"
        :key="JSON.stringify(this.currentTable)"
      ></spreadsheet>
    </div>
    <div class="specmenu">
      <div class="speccomponent">
        <a-tooltip>
          <template slot="title">What object does each row represent?</template>
          <div class="spectitle">Row header:</div>
        </a-tooltip>
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
            @contextmenu.prevent="openMenu($event, item, 'row', index)"
          >
            <div v-if="index != 0" class="specoperator">×</div>
            <div class="spectext">
              {{
                item.description
                  ? item.description
                  : item.data
                  ? `${item.data}.${item.attribute}`
                  : `${item.attribute}`
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="speccomponent">
        <a-tooltip>
          <template slot="title"> What object does each column represent? </template>
          <div class="spectitle">Column header:</div>
        </a-tooltip>
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
            @contextmenu.prevent="openMenu($event, item, 'column', index)"
          >
            <div v-if="index != 0" class="specoperator">×</div>
            <div class="spectext">
              {{
                item.description
                  ? item.description
                  : item.data
                  ? `${item.data}.${item.attribute}`
                  : `${item.attribute}`
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="speccomponent">
        <a-tooltip>
          <template slot="title">Details of the object defined by each row and column.</template>
          <div class="spectitle">Body:</div>
        </a-tooltip>
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
            @contextmenu.prevent="openMenu($event, 'body', index)"
          >
            <div v-if="index != 0" class="specoperator">+</div>
            <div class="spectext">
              {{
                item.description
                  ? item.description
                  : item.data
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

      <!-- context menu -->
      <div
        v-show="visible"
        :style="{ left: left + 'px', top: top + 'px' }"
        class="contextmenu"
        id="menu_spreadsheetview"
      >
        <div>
          <div class="menutext">Sorting</div>
          <a-switch class="menuswitch" size="small" v-model="menuSortEnable" />
        </div>
        <div v-if="menuSortEnable">
          <a-radio-group v-model="menuSort">
            <a-radio :value="1"> Ascending </a-radio>
            <br />
            <a-radio :value="2"> Descending </a-radio>
          </a-radio-group>
        </div>
        <div class="dashline"></div>

        <div>
          <div class="menutext">Filtering</div>
          <a-switch
            class="menuswitch"
            size="small"
            v-model="menuFilterEnable"
          />
        </div>
        <!-- Categorical -->
        <div
          v-if="
            menuFilterEnable &&
            this.rightClickItem &&
            this.rightClickItemValueList.length > 0 &&
            this.rightClickItemIsCategorical
          "
        >
          <a-checkbox-group
            v-model="menuFilterValue"
            name="checkboxgroup"
            :options="this.rightClickItemValueList"
          />
        </div>
        <!-- Quantitative -->
        <div
          v-if="
            menuFilterEnable &&
            this.rightClickItem &&
            this.rightClickItemValueList.length > 0 &&
            !this.rightClickItemIsCategorical
          "
        >
          <a-input-number
            class="menuInputNumber"
            v-model="menuFilterLowerBound"
          />
          <div class="menuInputNumberLine" />
          <a-input-number
            class="menuInputNumber"
            v-model="menuFilterUpperBound"
          />
        </div>

        <div class="dashline"></div>
        <!-- Quantitative Only -->
        <div v-if="this.rightClickItem && !this.rightClickItemIsCategorical">
          <div>
            <div class="menutext">Binning</div>
            <a-switch class="menuswitch" size="small" v-model="menuBinEnable" />
          </div>
          <div v-if="menuBinEnable">
            <a-input-number
              class="menuInputNumber"
              v-model="menuBinLowerBound"
            />
            <div class="menuInputNumberLine" />
            <a-input-number
              class="menuInputNumber"
              v-model="menuBinUpperBound"
            />
            <div>
              <div class="menutext">Step:</div>
              <a-input-number
                class="menuInputNumber"
                :min="1"
                v-model="menuBinStep"
              />
            </div>
          </div>
          <div class="dashline"></div>
        </div>

        <div class="menuButtonContainer">
          <a-button type="primary" class="menubutton" @click="onMenuApply">
            Apply
          </a-button>
          <a-button class="menubutton" @click="onMenuReset"> Reset </a-button>
        </div>
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
  data() {
    return {
      rightClickItem: {},
      rightClickItemSource: "",
      rightClickItemIndex: 0,
      rightClickItemValueList: [],
      rightClickItemIsCategorical: true,
      visible: false,
      left: 0,
      top: 0,
      menuSortEnable: true,
      menuSort: 1,
      menuFilterEnable: true,
      menuFilterValue: [],
      menuFilterUpperBound: null,
      menuFilterLowerBound: null,
      menuBinEnable: true,
      menuBinUpperBound: null,
      menuBinLowerBound: null,
      menuBinStep: 5,
      justreset: false,
    };
  },
  computed: {
    ...mapState([
      "currentTable",
      "rawRelations",
      "attrInfo",
      "newSpec",
      "row_header",
      "column_header",
      "body",
      "canSuggest",
      "rowInfo",
      "colInfo",
      "partialSpecSuggestion"
    ]),
  },
  watch: {
    newSpec(val, oldval) {
      console.log(val);
      console.log(this.canSuggest);
      if (val) {
        // this.row_header = Utils.specObj2List(val["row_header"]);
        // this.column_header = Utils.specObj2List(val["column_header"]);
        // this.body = Utils.specObj2List(val["body"]);
        this.setSpec({
          row_header: Utils.specObj2List(val["row_header"]),
          column_header: Utils.specObj2List(val["column_header"]),
          body: Utils.specObj2List(val["body"]),
        });
        this.storeNewSpec(null);
        if (!this.canSuggest) return;
        console.log("genalter");
        try {
          let alterSpec = Utils.genAlterSpec(
            this.row_header,
            this.column_header,
            this.body
          );
          this.storeAlterSpecList(alterSpec);
          let exploreSpec = Utils.genExploreSpec(
            this.row_header,
            this.column_header,
            this.body,
            this.attrInfo
          );
          this.storeSuggestion(exploreSpec);
        } catch (err) {
          console.log(err.message);
          this.$message.error(err.message);
        }
      }
    },
    row_header(val, oldval) {
      this.refineHeader(this.row_header);
      this.refineHeader(this.column_header);
      this.refineHeader(this.body);
      if (this.canSuggest) {
        this.applyHandler();
      }
    },
    column_header(val, oldval) {
      this.refineHeader(this.row_header);
      this.refineHeader(this.column_header);
      this.refineHeader(this.body);
      if (this.canSuggest) {
        this.applyHandler();
      }
    },
    body(val, oldval) {
      this.refineHeader(this.row_header);
      this.refineHeader(this.column_header);
      this.refineHeader(this.body);
      if (this.canSuggest) {
        this.applyHandler();
      }
    },
    visible(value) {
      if (value) {
        document.body.addEventListener("click", this.closeMenu);
      } else {
        document.body.removeEventListener("click", this.closeMenu);
      }
    },
    menuSortEnable(value) {
      if (value) {
        this.menuFilterEnable = this.menuBinEnable = false;
      }
    },
    menuFilterEnable(value) {
      if (value) {
        this.menuSortEnable = this.menuBinEnable = false;
      }
    },
    menuBinEnable(value) {
      if (value) {
        this.menuSortEnable = this.menuFilterEnable = false;
      }
    },
  },
  methods: {
    ...mapActions([
      "storeCurrentTable",
      "storeAlterSpecList",
      "storeSuggestion",
      "storeNewSpec",
      "setSpec",
      "storeRowInfo",
      "storeColInfo",
      "storeAttrInfo"
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
        this.storeRowInfo({
          row: this.column_header.length ? this.column_header.length : 1,
          column: 0,
          len: this.row_header.length, 
        });
        this.storeColInfo({
          row: 0,
          column: this.row_header.length ? this.row_header.length : 1,
          len: this.column_header.length,        
        });
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
        row_header: [],
        column_header: [],
        body: [],
      });
      this.storeCurrentTable(undefined);
      this.$forceUpdate();
    },
    applyHandler() {
      console.log("applyhandler");
      try {
        console.log(this.row_header);
        let alterSpec = Utils.genAlterSpec(
          this.row_header,
          this.column_header,
          this.body
        );
        console.log(alterSpec);
        this.storeAlterSpecList(alterSpec);
        let exploreSpec = Utils.genExploreSpec(
          this.row_header,
          this.column_header,
          this.body,
          this.attrInfo
        );
        this.storeSuggestion(exploreSpec);
      } catch (err) {
        console.log(err.message);
        this.$message.error(err.message);
      }
    },
    rearrangeHandler() {
      if(this.partialSpecSuggestion) {
        this.$message.error("Please first disambiguate your specification.");
        return;
      }
      console.log(this.rowInfo, this.colInfo);
      if (!this.rowInfo || !this.colInfo) return;
      let newTable = Utils.rearrangeTable(
        this.currentTable,
        this.rowInfo,
        this.colInfo
      );
      this.storeCurrentTable(newTable);
      this.storeRowInfo({
        row: this.colInfo.len,
        column: 0,
        len: this.rowInfo.len,
      });
      this.storeColInfo({
        row: 0,
        column: this.rowInfo.len,
        len: this.colInfo.len,
      });
    },
    refineHeader(header) {
      if (!header) return;
      for (let i = 0; i < header.length; i++) {
        let attr = header[i];
        if (!attr.strName) {
          header[i]["description"] = Utils.calString(header[i]);
        }
      }
    },
    openMenu(e, item, source, index) {
      console.log(item);
      let valueList = [];
      if (item.valueList) {
        valueList = item.valueList;
      } else {
        valueList = Utils.findValueList(item, this.attrInfo);
      }
      console.log(valueList);
      this.rightClickItem = item;
      this.rightClickItemSource = source;
      this.rightClickItemIndex = index;
      this.rightClickItemValueList = valueList;
      this.rightClickItemIsCategorical = Utils.isCategorical(valueList);
      this.menuSortEnable = this.menuFilterEnable = this.menuBinEnable = false;
      this.menuSort = 1;
      if (this.rightClickItemIsCategorical) {
        this.menuFilterValue = valueList;
      } else {
        this.menuBinUpperBound = this.menuFilterUpperBound = Math.max(
          ...valueList
        );
        this.menuBinLowerBound = this.menuFilterLowerBound = Math.min(
          ...valueList
        );
        this.menuBinStep = 5;
      }

      let x = e.clientX;
      let y = e.clientY;

      this.top = y - 120;
      this.left = x;

      this.visible = true;
    },
    closeMenu(e) {
      if(this.justreset) return;
      let x = e.clientX;
      let y = e.clientY;
      let menu = document.getElementById("menu_spreadsheetview");
      if (
        x < this.left ||
        x > this.left + menu.clientWidth ||
        y < this.top ||
        y > this.top + menu.clientHeight
      ) {
        this.visible = false;
      }
    },
    onMenuApply() {
      if (
        !this.menuSortEnable &&
        !this.menuBinEnable &&
        !this.menuFilterEnable
      ) {
        this.$message.error("Please select an action");
        return;
      }
      let op = this.rightClickItem;
      let associationRule;
      let colorList = Utils.genRandomColor(1);
      let res = null;

      if (this.menuSortEnable) {
        if (this.menuSort == 1) {
          associationRule = "ascsort";
        } else if (this.menuSort == 2) {
          associationRule = "descsort";
        } else {
          this.$message.error("Sort Type Undefined");
        }
        let valueList = [];
        for (let i = 0; i < this.rightClickItemValueList.length; i++) {
          valueList.push(this.rightClickItemValueList[i]);
        }
        if (associationRule == "ascsort") {
          valueList.sort();
        } else {
          valueList.sort().reverse();
        }
        let strName = {
          operator: associationRule,
          parameters: [op.strName ? op.strName : op],
        };
        // let attrName = op.strName ? (op.data ? `${op.data}.${op.attribute}` : op.attribute) : Utils.calString(op);
        let attrName = Utils.calString(strName);
        res = {
          strName: strName,
          // attribute: `${associationRule}(${attrName})`,
          attribute: attrName,
          color: colorList[0],
          valueList: Utils.unique(valueList),
        };
      } else if (this.menuBinEnable) {
        associationRule = "bin";
        if (this.menuBinLowerBound > this.menuBinUpperBound) {
          this.$message.error("Illegal bound for binning");
          return;
        }
        let interval =
          (this.menuBinUpperBound - this.menuBinLowerBound) / this.menuBinStep;
        let valueList = [];
        for (let i = 0; i < this.menuBinStep; i++) {
          let low = this.menuBinLowerBound + i * interval,
            high = low + interval;
          low = Math.round(low * 100) / 100;
          high = Math.round(high * 100) / 100;
          valueList.push(
            `[${low}, ${high}` + (i < this.menuBinStep - 1 ? ")" : "]")
          );
        }
        let strName = {
          operator: associationRule,
          parameters: [
            op.strName ? op.strName : op,
            { value: this.menuBinStep },
            { value: this.menuBinLowerBound },
            { value: this.menuBinUpperBound },
          ],
        };
        // let attrName = op.data ? `${op.data}.${op.attribute}` : op.attribute;
        let attrName = Utils.calString(strName);
        res = {
          strName: strName,
          // attribute: `${associationRule}(${attrName}, ${this.menuBinStep}, ${this.menuBinLowerBound}, ${this.menuBinUpperBound})`,
          attribute: attrName,
          color: colorList[0],
          valueList: valueList,
        };
      } else if (this.menuFilterEnable) {
        if (this.rightClickItemIsCategorical) {
          associationRule = "filterByValue";
          let valueList = [];
          for (let i = 0; i < this.menuFilterValue.length; i++) {
            valueList.push(this.menuFilterValue[i]);
          }
          if (valueList.length == 0) {
            this.$message.error("No satisfied item");
            return;
          }
          let parameters = [op.strName ? op.strName : op];
          // valueList.forEach((item) => {
          //   parameters.push({ value: item });
          // });
          for (let i = 0; i < valueList.length; i++) {
            parameters.push({
              value: valueList[i],
            });
          }
          let strName = {
            operator: associationRule,
            parameters,
          };
          // let attrName = op.data ? `${op.data}.${op.attribute}` : op.attribute;
          let attrName = Utils.calString(strName);
          // let attributeName = `${associationRule}(${attrName}`;
          // valueList.forEach((item) => {
          //   attributeName += `, ${item}`;
          // });
          // attributeName += ")";
          res = {
            strName: strName,
            // attribute: attributeName,
            attribute: attrName,
            color: colorList[0],
            valueList: Utils.unique(valueList),
          };
        } else {
          associationRule = "filterByBound";
          let valueList = [];
          for(let i=0;i<this.rightClickItemValueList.length;i++) {
            let item = this.rightClickItemValueList[i];
            if (
              item >= this.menuFilterLowerBound &&
              item <= this.menuFilterUpperBound
            ) {
              valueList.push(item);
            }
          };
          if (valueList.length == 0) {
            this.$message.error("No satisfied item");
            return;
          }
          let strName = {
            operator: associationRule,
            parameters: [
              op.strName ? op.strName : op,
              { value: this.menuFilterLowerBound },
              { value: this.menuFilterUpperBound },
            ],
          };
          res = {
            strName: strName,
            // attribute: `${associationRule}(${op.attribute}, ${this.menuFilterLowerBound}, ${this.menuFilterUpperBound})`,
            attribute: Utils.calString(strName),
            color: colorList[0],
            valueList: Utils.unique(valueList),
          };
        }
      }
      this.storeAttrInfo(res);
      console.log(res);
      if(this.rightClickItemSource == "row") {
        this.row_header[this.rightClickItemIndex] = res;
      } else if(this.rightClickItemSource == "column") {
        this.column_header[this.rightClickItemIndex] = res;
      } else {
        this.body[this.rightClickItemIndex] = res;
      }
      let spec = Utils.genSpec(this.row_header, this.column_header, this.body);
      this.storeNewSpec(spec);
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
      console.log(this.canSuggest);
      this.visible = false;
    },
    onMenuReset() {
      this.justreset = true;
      setTimeout(() => {
        this.justreset = false;
      }, 200);
      this.menuSortEnable = this.menuFilterEnable = this.menuBinEnable = false;
      this.menuSort = 1;
      if (this.rightClickItemIsCategorical) {
        this.menuFilterValue = this.rightClickItemValueList;
      } else {
        this.menuBinUpperBound = this.menuFilterUpperBound = Math.max(
          ...this.rightClickItemValueList
        );
        this.menuBinLowerBound = this.menuFilterLowerBound = Math.min(
          ...this.rightClickItemValueList
        );
        this.menuBinStep = 5;
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

.rearrange-button {
  padding: 0;
  text-align: center;
  width: 80px;
  /* margin: 10px 0; */
}
</style>
