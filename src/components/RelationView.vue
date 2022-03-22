<template>
  <div class="relation-view" id="relation-view">
    <div id="dataset-toolbar">
      <div class="view-title">Raw Tables</div>
      <div id="dataset-select">
        <a-select
          placeholder="Select Example Tables"
          style="width: 100%"
          :allowClear="true"
          @change="handleChange"
        >
          <a-select-option
            v-for="data in EXAMPLE_DATA"
            :key="data.id"
            :value="JSON.stringify(data)"
          >
            {{ data.id }}
          </a-select-option>
        </a-select>
      </div>
      <a-button class="header-button" @click="importDataset">
        Import
      </a-button>
      <a-button class="header-button" @click="importNewData">
        Import New
      </a-button>
      <a-radio-group v-model="value" @change="onChangeMode" default-value="union" >
        <a-radio-button class="header-button" value="union" style="margin-left: 10px !important;"
          >Union(Outer Join)</a-radio-button
        >
        <a-radio-button class="header-button" value="intersect"
          >Intersection(Inner Join)</a-radio-button
        >
      </a-radio-group>
    </div>
    <div class="barchart-container" v-if="attrInfo && attrInfo.length > 0">
      <div
        class="attrCard"
        v-for="(attr, index) in attrInfo"
        :key="`${attr.data}_${attr.attribute}_${index}`"
        :id="`attr_${JSON.stringify(attr)}`"
        :data-info="JSON.stringify(attr)"
        :draggable="true"
        @dragstart="attrDragHandler"
        @drop="attrDropHandler"
        @dragover="attrAllowDrop"
        @contextmenu.prevent="openMenu($event, attr)"
      >
        <div class="attrInfo-text">
          {{
            attr.data ? `${attr.data}.${attr.attribute}` : `${attr.attribute}`
          }}
        </div>
        <div class="attrInfo-barchart">
          <mychart :chartId="`attr_${index}`" :attr="attr"> </mychart>
        </div>
        <div class="attrInfo-handle">
          <a-popconfirm placement="bottomLeft" class="attrInfo-popconfirm">
            <div style="display:none" slot="icon"/>
            <a-button type="primary" class="attrInfo-button" @click="openMenu($event, attr)">Derive</a-button>
            <template slot="title">
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
                  rightClickItem &&
                  rightClickItem.valueList &&
                  rightClickItem.valueList.length > 0 &&
                  rightClickItemIsCategorical
                "
              >
                <a-checkbox-group
                  v-model="menuFilterValue"
                  name="checkboxgroup"
                  :options="rightClickItem.valueList"
                  @change="onFilterCheckboxChange"
                />
              </div>

              <!-- Quantitative -->
              <div
                v-if="
                  menuFilterEnable &&
                  rightClickItem &&
                  rightClickItem.valueList &&
                  rightClickItem.valueList.length > 0 &&
                  !rightClickItemIsCategorical
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
              <div v-if="rightClickItem && !rightClickItemIsCategorical">
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
            </template>
          </a-popconfirm>
        </div>
      </div>
    </div>
    <div v-else class="barchart-container">
      <a-empty class="attrInfo-empty"/>
    </div>

    <div class="relations-container">
      <spreadsheet v-if="relations.length == 0" class="source-table" />
      <a-tabs
        v-else
        type="editable-card"
        @edit="onTabEdit"
        @change="onTabChange"
        :hideAdd="true"
        tabPosition="bottom"
      >
        <a-tab-pane
          v-for="(relation, index) in relations"
          :key="index"
          :tab="relation.name"
        >
          <div class="source-table">
            <spreadsheet
              :name="relation.name"
              :head="relation.entityOrder"
              :table="relation.relation"
              :headColor="relation.color"
              :editable="false"
            ></spreadsheet>
          </div>
          <!-- <div class="source-table-text">
            {{`${relation.relation.length} records, ${relation.entityOrder.length} dimensions`}}
          </div> -->
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import Spreadsheet from "./Spreadsheet/Index.vue";
import Cell from "./Spreadsheet/Cell.vue";
import Mychart from "../components/Mychart/Index.vue";
import Utils from "@/utils.js";
import { EXAMPLE_DATA } from "@/CONSTANT";

export default {
  name: "RelationView",
  data() {
    return {
      rightClickItem: {},
      rightClickItemIsCategorical: true,
      visible: false,
      top: 0,
      left: 0,
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
      selectedValue: null,
      value: "union",
    };
  },
  computed: {
    ...mapState(["relations", "attrInfo", "associationRule"]),
    EXAMPLE_DATA() {
      return EXAMPLE_DATA;
    },
  },
  watch: {
    // visible(value) {
    //   if (value) {
    //     document.body.addEventListener("click", this.closeMenu);
    //   } else {
    //     document.body.removeEventListener("click", this.closeMenu);
    //   }
    // },
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
    let tmp1 = document.getElementById("relation-view"),
      tmp2 = document.getElementById("body-container");
    let rect1 = tmp1.getBoundingClientRect(),
      rect2 = tmp2.getBoundingClientRect();
    // console.log(rect1, rect2);
    el.style.top = `${rect1.top - rect2.top}px`;
    el.style.left = `${rect1.left - rect2.left}px`;
    tmp1.appendChild(el);
  },
  methods: {
    ...mapMutations(["changeActivatedRelationIndex", "removeRelationByIndex"]),
    ...mapActions([
      "storeAttrInfo",
      "setDragSource",
      "storeCurrentState",
      "storeRelation",
      "storeRawRelation",
      "storeAssociationRule",
      "storeCurrentState",
    ]),
    onChangeMode(){
      // console.log(this.value);
      this.storeAssociationRule(this.value);
    },
    handleChange(value) {
      if (!value || value === "") {
        Object.assign(this, {
          selectedValue: null,
        });
        return;
      }
      let res = JSON.parse(value);
      // console.log(res);
      Object.assign(this, {
        selectedValue: res,
      });
    },
    async importDataset() {
      if (!this.selectedValue) {
        this.$message.error("Please select a dataset");
        return;
      }
      try {
        // console.log(this.selectedValue.value);
        this.importData(JSON.stringify(this.selectedValue.value));
      } catch (e) {
        console.log(e);
        this.$message.error("Unsupported File Type");
      }
    },
    async selectData() {
      return new Promise((resolve, reject) => {
        let input = document.createElement("input");
        input.value = "select file";
        input.type = "file";
        input.onchange = (event) => {
          let file = event.target.files[0];
          let file_reader = new FileReader();
          file_reader.onload = () => {
            let fc = file_reader.result;
            resolve(fc); // 返回文件文本内容到Promise
          };
          file_reader.readAsText(file, "UTF-8");
        };
        input.click();
      });
    },
    async importNewData() {
      let rawData = await this.selectData();
      this.importData(rawData);
    },
    async importData(rawData) {
      // let rawData = await this.selectData();
      console.log(rawData);
      try {
        let jsonData = JSON.parse(rawData);
        console.log(jsonData);
        // 这里留个坑，先只做一次导入一张表，多张表的情况后面迭代吧
        let keys = Object.keys(jsonData.values[0]);
        let relation = [];
        jsonData.values.forEach((item) => {
          let newItem = [];
          keys.forEach((key) => {
            newItem.push({
              value: item[key],
              source: {
                operator: "attr",
                data: jsonData.name,
                attribute: key,
              },
            });
          });
          relation.push(newItem);
        });
        let colorList = Utils.genRandomColor(keys.length);
        console.log("color", colorList);
        let res = {
          name: jsonData.name,
          entityOrder: keys,
          relation: relation,
          color: colorList,
        };
        console.log("res: ", res);
        this.storeRelation(res);
        let attrInfo = [];
        keys.forEach((key, index) => {
          let valueList = [];
          jsonData.values.forEach((item) => {
            valueList.push(item[key]);
          });
          attrInfo.push({
            data: jsonData.name,
            attribute: key,
            strName: { operator: "attr", data: jsonData.name, attribute: key },
            color: colorList[index],
            valueList: Utils.unique(valueList),
            isCategorical: Utils.isCategorical(valueList),
          });
        });
        console.log("attrInfo:", attrInfo);
        this.storeAttrInfo(attrInfo);
        this.storeRawRelation(jsonData);
        this.storeCurrentState();
      } catch (e) {
        console.log(e);
        this.$message.error("Unsupported File Type");
      }
    },
    onTabChange(targetIndex) {
      this.changeActivatedRelationIndex(targetIndex);
    },
    onTabEdit(targetIndex, action) {
      if (action == "remove") {
        this.removeRelationByIndex(targetIndex);
      }
    },
    attrDragHandler(event) {
      event.dataTransfer.setData("info", event.target.dataset.info);
      event.dataTransfer.setData("type", "attr");
      sessionStorage.setItem("info", event.target.dataset.info);
      sessionStorage.setItem("type", "attr");
      sessionStorage.setItem("id", event.target.id);
      this.setDragSource(false);
    },

    attrAllowDrop(event) {
      event.preventDefault();
      event.stopPropagation();
    },

    attrDropHandler(event) {
      event.preventDefault();
      if (event.dataTransfer.getData("type") !== "attr") {
        return;
      }
      let op1 = JSON.parse(event.dataTransfer.getData("info"));
      let op2 = JSON.parse(event.target.dataset.info);
      //union
      let colorList = Utils.genRandomColor(1);
      let valueList = [];
      op1.valueList.forEach((item) => {
        valueList.push(item);
      });
      op2.valueList.forEach((item) => {
        valueList.push(item);
      });
      let strName = {
        operator: this.associationRule,
        parameters: [op1.strName, op2.strName],
      };
      let name1 = op1.data ? `${op1.data}.${op1.attribute}` : op1.attribute;
      let name2 = op2.data ? `${op2.data}.${op2.attribute}` : op2.attribute;
      let res = {
        strName: strName,
        attribute: `${this.associationRule}(${name1}, ${name2})`,
        color: colorList[0],
        valueList: Utils.unique(valueList),
        isCategorical: Utils.unique(valueList),
      };
      this.storeAttrInfo(res);
      console.log(res);
      this.storeCurrentState();
    },

    openMenu(e, item) {
      this.rightClickItem = item;
      this.rightClickItemIsCategorical = item.isCategorical;
      this.menuSortEnable = this.menuFilterEnable = this.menuBinEnable = false;
      this.menuSort = 1;
      if (this.rightClickItemIsCategorical) {
        this.menuFilterValue = item.valueList;
      } else {
        this.menuBinUpperBound = this.menuFilterUpperBound = Math.max(
          ...item.valueList
        );
        this.menuBinLowerBound = this.menuFilterLowerBound = Math.min(
          ...item.valueList
        );
        this.menuBinStep = 5;
      }

      // console.log(item);
      // console.log(this.rightClickItemIsCategorical);
      // console.log(this.menuFilterValue);
    },
    // closeMenu(e) {
    //   if (this.justreset) return;
    //   let x = e.clientX;
    //   let y = e.clientY;
    //   let menu = document.getElementById("menu");
    //   console.log(x, y, this.left, this.top, menu.clientHeight, menu.clientWidth);
    //   if (
    //     x < this.left ||
    //     x > this.left + menu.clientWidth ||
    //     y < this.top ||
    //     y > this.top + menu.clientHeight
    //   ) {
    //     this.visible = false;
    //   }
    // },

    onFilterCheckboxChange() {
      console.log(this.menuFilterValue);
    },

    onMenuReset() {
      this.justreset = true;
      setTimeout(() => {
        this.justreset = false;
      }, 200);
      this.menuSortEnable = this.menuFilterEnable = this.menuBinEnable = false;
      this.menuSort = 1;
      if (this.rightClickItemIsCategorical) {
        this.menuFilterValue = this.rightClickItem.valueList;
      } else {
        this.menuBinUpperBound = this.menuFilterUpperBound = Math.max(
          ...this.rightClickItem.valueList
        );
        this.menuBinLowerBound = this.menuFilterLowerBound = Math.min(
          ...this.rightClickItem.valueList
        );
        this.menuBinStep = 5;
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

      if (this.menuSortEnable) {
        if (this.menuSort == 1) {
          associationRule = "ascsort";
        } else if (this.menuSort == 2) {
          associationRule = "descsort";
        } else {
          this.$message.error("Sort Type Undefined");
        }
        let valueList = [];
        op.valueList.forEach((item) => {
          valueList.push(item);
        });
        if (associationRule == "ascsort") {
          valueList.sort();
        } else {
          valueList.sort().reverse();
        }
        let strName = {
          operator: associationRule,
          parameters: [op.strName],
        };
        let attrName = op.data ? `${op.data}.${op.attribute}` : op.attribute;
        let res = {
          strName: strName,
          attribute: `${associationRule}(${attrName})`,
          color: colorList[0],
          valueList: Utils.unique(valueList),
          isCategorical: Utils.isCategorical(valueList),
        };
        this.storeAttrInfo(res);
        console.log(res);
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
            op.strName,
            { value: this.menuBinStep },
            { value: this.menuBinLowerBound },
            { value: this.menuBinUpperBound },
          ],
        };
        let attrName = op.data ? `${op.data}.${op.attribute}` : op.attribute;
        let res = {
          strName: strName,
          attribute: `${associationRule}(${attrName}, ${this.menuBinStep}, ${this.menuBinLowerBound}, ${this.menuBinUpperBound})`,
          color: colorList[0],
          valueList: valueList,
          isCategorical: Utils.isCategorical(valueList),
        };
        this.storeAttrInfo(res);
        console.log(res);
      } else if (this.menuFilterEnable) {
        if (this.rightClickItemIsCategorical) {
          associationRule = "filterByValue";
          let valueList = [];
          this.menuFilterValue.forEach((item) => {
            valueList.push(item);
          });
          if (valueList.length == 0) {
            this.$message.error("No satisfied item");
            return;
          }
          let parameters = [op.strName];
          valueList.forEach((item) => {
            parameters.push({ value: item });
          });
          let strName = {
            operator: associationRule,
            parameters,
          };
          let attrName = op.data ? `${op.data}.${op.attribute}` : op.attribute;
          let attributeName = `${associationRule}(${attrName}`;
          valueList.forEach((item) => {
            attributeName += `, ${item}`;
          });
          attributeName += ")";
          let res = {
            strName: strName,
            attribute: attributeName,
            color: colorList[0],
            valueList: Utils.unique(valueList),
            isCategorical: Utils.isCategorical(valueList),
          };
          this.storeAttrInfo(res);
          console.log(res);
        } else {
          associationRule = "filterByBound";
          let valueList = [];
          op.valueList.forEach((item) => {
            if (
              item >= this.menuFilterLowerBound &&
              item <= this.menuFilterUpperBound
            ) {
              valueList.push(item);
            }
          });
          if (valueList.length == 0) {
            this.$message.error("No satisfied item");
            return;
          }
          let strName = {
            operator: associationRule,
            parameters: [
              op.strName,
              { value: this.menuFilterLowerBound },
              { value: this.menuFilterUpperBound },
            ],
          };
          let res = {
            strName: strName,
            attribute: `${associationRule}(${op.attribute}, ${this.menuFilterLowerBound}, ${this.menuFilterUpperBound})`,
            color: colorList[0],
            valueList: Utils.unique(valueList),
            isCategorical: Utils.isCategorical(valueList),
          };
          this.storeAttrInfo(res);
          console.log(res);
        }
      }
      this.storeCurrentState();
    },
  },
  components: {
    Spreadsheet,
    Mychart,
    // Cell,
  },
};
</script>

<style>
.relation-view {
  width: 100%;
  overflow: hidden;
}

.relations-container {
  /* min-height: 10%; */
  text-align: left;
  height: 180px;
}

.source-table {
  height: 137px;
  overflow: scroll;
}

.source-table-text {
  text-align: right;
  margin: 0 5px 0 5px;
  border-bottom: 1px solid #eaebee;
}

::-webkit-scrollbar :horizontal{
  height: 4px;
  background: gray;
}

.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  padding: 10px 10px;
  border: 0.5px solid #dbd8d8;
  overflow: scroll;
  text-align: left;
  padding: 12px 16px;
}

.contextmenu::-webkit-scrollbar {
  /*隐藏滚轮*/
  display: none;
}

.dashline {
  margin-top: 7px;
  border-top: 2px dashed #cccccc;
  height: 1px;
  overflow: hidden;
}

.menubutton {
  width: 52px;
  height: 26px !important;
  padding: 0px 2px 0px 2px !important;
  margin: auto 7px auto 7px;
  text-align: center;
  display: inline-block;
}

.menuButtonContainer {
  vertical-align: center;
  text-align: center;
  margin: 7px auto;
}

.menuInputNumber {
  width: 72px;
  height: 30px;
  display: inline-block;
  margin: 4px auto 4px auto;
  padding: 0px 2px 4px 2px;
}

.menutext {
  display: inline-block;
  margin-right: 5px;
}

.menuswitch {
  display: inline-block;
}

.menuInputNumberLine {
  display: inline-block;
  border-top: 2px dashed;
  width: 10px;
  margin: 3px 5px 6px 5px;
}

#dataset-toolbar {
  display: inline-block;
  margin-right: 30px;
  white-space: nowrap;
  overflow-x: hidden;
}

#dataset-select {
  display: inline-block;
  margin-left: 45px;
  width: 200px;
}

.header-button {
  display: inline-block;
  margin-left: 10px;
  text-align: center;
  padding: 2px 9px 2px 9px;
}

.barchart-container {
  overflow-x: scroll;
  white-space: nowrap;
  margin-top: 5px;
  height: 235px;
}

.attrCard {
  margin-left: 5px;
  margin-right: 5px;
  display: inline-block;
  margin: 5px 5px 5px 5px;
  padding: 5px 5px 5px 5px;
  border: 1.5px solid #d5d5d5;
}

.attrInfo-text {
  line-height: 20px;
  height: 20px;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
  display: inline-block;
  pointer-events: none;
}

.attrInfo-barchart {
  border-top: 1.5px solid #d5d5d5;
  height: 140px;
  overflow-x: scroll;
  overflow-y: hidden;
}

.attrInfo-handle {
  display: flex;
  justify-content: center;
}

.attrInfo-button {
  width: 52px;
  height: 24px !important;
  text-align: center;
  padding: 0px 4px 0px 4px !important;
}

.attrInfo-empty {
  height: 100px;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
