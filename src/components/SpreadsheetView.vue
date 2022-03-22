<template>
  <div class="spreadsheet-view" id="spreadsheet-view">
    <div id="title-container">
      <div class="view-title">Target Table</div>
      <a-button class="rearrange-button" @click="rearrangeHandler">
        Optimize Layout
      </a-button>
      <a-button class="specbutton" @click="resetHandler">Clear Table</a-button>
      <a-button class="specbutton" @click="exportHandler"
        >Export Table</a-button
      >
    </div>

    <div class="specmenu" id="specmenu">
      <div class="speccomponent">
        <div class="spectitle">
          <i class="icon iconfont">&#xe7e0;</i>
          <div class="spectitle-text">Row</div>
        </div>
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
        <div class="spectitle">
          <i class="icon iconfont" style="transform: rotate(90deg)">&#xe7e0;</i>
          <div class="spectitle-text">Column</div>
        </div>
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
        <div class="spectitle">
          <i class="icon iconfont">&#xebbf;</i>
          <div class="spectitle-text">Cell</div>
        </div>
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
    </div>

    <div class="targetTableContainer" id="targetTableContainer">
      <spreadsheet
        name="targetTable"
        :editable="true"
        :table="this.currentTable"
        :key="JSON.stringify(this.currentTable)"
      ></spreadsheet>
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
        <a-switch class="menuswitch" size="small" v-model="menuFilterEnable" />
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
          <a-input-number class="menuInputNumber" v-model="menuBinLowerBound" />
          <div class="menuInputNumberLine" />
          <a-input-number class="menuInputNumber" v-model="menuBinUpperBound" />
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
      "row_header",
      "column_header",
      "body",
      "rowInfo",
      "colInfo",
      "partialSpecSuggestion",
      "genRecommendation",
    ]),
  },
  watch: {
    // row_header(val, oldval) {
    //   this.refineHeader(this.row_header);
    //   this.refineHeader(this.column_header);
    //   this.refineHeader(this.body);
    //   this.applyHandler();
    // },
    // column_header(val, oldval) {
    //   this.refineHeader(this.row_header);
    //   this.refineHeader(this.column_header);
    //   this.refineHeader(this.body);
    //   this.applyHandler();
    // },
    // body(val, oldval) {
    //   this.refineHeader(this.row_header);
    //   this.refineHeader(this.column_header);
    //   this.refineHeader(this.body);
    //   this.applyHandler();
    // },
    genRecommendation(val, oldval) {
      if (val) {
        console.log("ok");
        this.refineHeader(this.row_header);
        this.refineHeader(this.column_header);
        this.refineHeader(this.body);
        this.applyHandler();
        this.storeGenRecommendation(false);
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
  mounted() {
    let el = document.createElement("div");
    el.className = "title-bg";
    let tmp1 = document.getElementById("spreadsheet-view"),
      tmp2 = document.getElementById("body-container");
    let rect1 = tmp1.getBoundingClientRect(),
      rect2 = tmp2.getBoundingClientRect();
    // console.log(rect1, rect2);
    el.style.top = `${rect1.top - rect2.top}px`;
    el.style.left = `${rect1.left - rect2.left}px`;
    tmp1.appendChild(el);

    let el2 = document.getElementById("spreadsheet-container");
    let el3 = document.getElementById("title-container");
    let el4 = document.getElementById("specmenu");
    let el5 = document.getElementById("targetTableContainer");

    let height =
      el2.getBoundingClientRect().height -
      el3.getBoundingClientRect().height -
      el4.getBoundingClientRect().height;
    height -= 9; //margin
    console.log(height);
    el5.style.height = `${height}px`;
    console.log(el5.style.height);
  },
  methods: {
    ...mapActions([
      "storeCurrentTable",
      "storeAlterSpecList",
      "storeSuggestion",
      "setSpec",
      "storeRowInfo",
      "storeColInfo",
      "storeAttrInfo",
      "storeCurrentState",
      "storeGenRecommendation",
    ]),
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
              tmp.value =
                typeof res[i][j].value != "undefined"
                  ? res[i][j].value
                  : res[i][j];
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
        this.storeGenRecommendation(true);
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
      this.storeGenRecommendation(true);
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
        this.storeCurrentState();
      } catch (err) {
        console.log(err.message);
        this.$message.error(err.message);
        throw err;
      }
    },
    rearrangeHandler() {
      if (this.partialSpecSuggestion) {
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
      this.storeCurrentState();
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

      this.top = y;
      this.left = x;

      console.log(x, y);

      this.visible = true;
    },
    closeMenu(e) {
      if (this.justreset) return;
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
          for (let i = 0; i < this.rightClickItemValueList.length; i++) {
            let item = this.rightClickItemValueList[i];
            if (
              item >= this.menuFilterLowerBound &&
              item <= this.menuFilterUpperBound
            ) {
              valueList.push(item);
            }
          }
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
            isCategorical: Utils.isCategorical(valueList),
          };
        }
      }
      this.storeAttrInfo(res);
      console.log(res);
      if (this.rightClickItemSource == "row") {
        this.row_header[this.rightClickItemIndex] = res;
      } else if (this.rightClickItemSource == "column") {
        this.column_header[this.rightClickItemIndex] = res;
      } else {
        this.body[this.rightClickItemIndex] = res;
      }
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
              tmp.value =
                typeof res[i][j].value != "undefined"
                  ? res[i][j].value
                  : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        console.log(res);
        this.storeCurrentTable(res);
        this.storeGenRecommendation(true);
      } catch (err) {
        this.$message.error("Illegal specification!");
        throw err;
      }
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
    exportHandler() {
      let table = this.currentTable;
      let CSV = "";
      let rowSize = 0,
        columnSize = 0;
      for (let i = table.length - 1; i >= 0; i--) {
        let ok = true;
        for (let j = 0; j < table[i].length; j++) {
          if (!table[i][j]) continue;
          if (table[i][j] == "" || table[i][j].value == "") continue;
          ok = false;
          break;
        }
        if (!ok) {
          rowSize = i + 1;
          break;
        }
      }
      for (let i = 0; i < rowSize; i++) {
        for (let j = table[i].length - 1; j >= 0; j--) {
          if (!table[i][j]) continue;
          if (table[i][j] == "" || table[i][j].value == "") continue;
          columnSize = columnSize > j + 1 ? columnSize : j + 1;
        }
      }
      for (let i = 0; i < rowSize; i++) {
        let linestr = "";
        for (let j = 0; j < columnSize; j++) {
          let tmp = table[i][j],
            realValue;
          if (tmp) {
            if (tmp.value) {
              if (!tmp.value.lower) {
                realValue = String(tmp.value);
              } else if (tmp.value.isRightOpen == true) {
                realValue = `[${tmp.value.lower}, ${tmp.value.upper})`;
              } else {
                realValue = `[${tmp.value.lower}, ${tmp.value.upper}]`;
              }
            } else if (typeof tmp.value != "undefined") {
              realValue = "";
            } else {
              realValue = String(tmp);
            }
          } else {
            realValue = "";
          }
          linestr += realValue;
          if (j == columnSize - 1) {
            linestr += "\r\n";
          } else {
            linestr += ",";
          }
        }
        CSV += String(linestr);
      }
      var fileName = "export";
      var uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURI(CSV);
      var link = document.createElement("a");
      link.href = uri;
      
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
  overflow: hidden;
}

.targetTableContainer {
  min-width: 500px;
  overflow: scroll;
  flex-direction: column;
  height: 0px;
}

/* .spreadsheet::-webkit-scrollbar {
  display: none; Chrome Safari
} */

.specmenu {
  text-align: left;
  margin-top: 4px;
  vertical-align: center;
  overflow: scroll;
  height: 40%;
}

.specmenu::-webkit-scrollbar {
  display: none;
}

.speccomponent {
  margin: 1px 2px 1px 2px;
  display: flex;
  justify-content: left;
  align-content: center;
  height: 28px;
}

.spectitle {
  display: flex;
  /* margin-bottom: 15px; */
  flex: 0 0 80px;
  text-align: left;
  background-color: #f2f2f2;
  border: 1px solid rgba(187, 187, 187, 100);
  padding: 0px 2px 0px 2px;
}

.spectitle-text {
  margin-left: 6px;
  margin-top: 1px;
}

.specinput {
  background: white;
  flex: 1 1 350px;
  border: 1px solid rgba(187, 187, 187, 100);
  overflow: auto;
  width: 0;
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
  padding: 2px 9px 2px 9px;
  margin-left: 10px;
  text-align: center;
  display: inline-block;
}

.spectoolbar {
  vertical-align: center;
  text-align: center;
  margin: 7px auto 50px;
}

.rearrange-button {
  padding: 2px 9px 2px 9px;
  text-align: center;
  /* width: 80px; */
  margin-left: 50px;
  display: inline-block;
  /* margin: 10px 0; */
}

.hint {
  color: #b3b3b3;
  margin-right: 3px;
  float: right;
  pointer-events: none;
}

#title-container {
  white-space: nowrap;
  overflow: hidden;
}
</style>
