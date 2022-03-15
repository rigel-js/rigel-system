<template>
  <div class="view relation-view">
    <div class="view-title">Raw Tables</div>
    <div class="relations-container">
      <spreadsheet v-if="relations.length == 0"></spreadsheet>
      <a-tabs
        v-else
        type="editable-card"
        @edit="onTabEdit"
        @change="onTabChange"
        :hideAdd="true"
      >
        <a-tab-pane
          v-for="(relation, index) in relations"
          :key="index"
          :tab="relation.name"
        >
          <div class="spreadsheet-container">
            <spreadsheet
              :name="relation.name"
              :head="relation.entityOrder"
              :table="relation.relation"
              :headColor="relation.color"
              :editable="false"
            ></spreadsheet>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="attrInfo-container" v-if="attrInfo && attrInfo.length > 0">
      <div
        class="attrInfo-box"
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
        <div
          class="attrInfo-block"
          :style="{ 'background-color': attr.color }"
        ></div>
        <div class="attrInfo-text">
          {{
            attr.data ? `${attr.data}.${attr.attribute}` : `${attr.attribute}`
          }}
        </div>
      </div>
    </div>
    <!-- contextMenu -->
    <div
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu"
      id="menu"
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
          this.rightClickItem.valueList &&
          this.rightClickItem.valueList.length > 0 &&
          this.rightClickItemIsCategorical
        "
      >
        <a-checkbox-group
          v-model="menuFilterValue"
          name="checkboxgroup"
          :options="this.rightClickItem.valueList"
          @change="onFilterCheckboxChange"
        />
      </div>
      <!-- Quantitative -->
      <div
        v-if="
          menuFilterEnable &&
          this.rightClickItem &&
          this.rightClickItem.valueList &&
          this.rightClickItem.valueList.length > 0 &&
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
import { mapState, mapMutations, mapActions } from "vuex";
import Spreadsheet from "./Spreadsheet/Index.vue";
import Cell from "./Spreadsheet/Cell.vue";
import Utils from "@/utils.js";

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
    };
  },
  computed: mapState({
    relations: (state) => state.relations,
    attrInfo: (state) => state.attrInfo,
    associationRule: (state) => state.associationRule,
  }),
  watch: {
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
    ...mapMutations(["changeActivatedRelationIndex", "removeRelationByIndex"]),
    ...mapActions(["storeAttrInfo", "setDragSource"]),
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
      };
      this.storeAttrInfo(res);
      console.log(res);
    },

    openMenu(e, item) {
      this.rightClickItem = item;
      this.rightClickItemIsCategorical = Utils.isCategorical(item.valueList);
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

      let x = e.clientX;
      let y = e.clientY;

      this.top = y;
      this.left = x;

      this.visible = true;
    },
    closeMenu(e) {
      if(this.justreset) return;
      let x = e.clientX;
      let y = e.clientY;
      let menu = document.getElementById("menu");
      if (
        x < this.left ||
        x > this.left + menu.clientWidth ||
        y < this.top ||
        y > this.top + menu.clientHeight
      ) {
        this.visible = false;
      }
    },

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
          };
          this.storeAttrInfo(res);
          console.log(res);
        }
      }
    },
  },
  components: {
    Spreadsheet,
    // Cell,
  },
};
</script>

<style>
.relation-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.relations-container {
  min-height: 10%;
  overflow: scroll;
  text-align: left;
  margin: 20px 0 5px 0;
}

.attrInfo-container {
  min-height: 30%;
  width: 90%;
  overflow: auto;
  text-align: left;
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 20px;
}

.attrInfo-container .attrInfo-box {
  height: 40px;
  width: auto;
  display: inline-block;
  margin-right: 30px;
}

.attrInfo-container .attrInfo-block {
  display: inline-block;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  pointer-events: none;
}

.attrInfo-container .attrInfo-text {
  line-height: 20px;
  height: 20px;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
  display: inline-block;
  margin-left: 9px;
  pointer-events: none;
}

.relations-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  padding: 10px 10px;
  border: 0.5px solid #dbd8d8;
  border-radius: 15px;
  overflow: scroll;
  text-align: left;
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
</style>
