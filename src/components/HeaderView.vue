<template>
  <div class="header-view">
    <div id="rigel-title">Rigel</div>
    <div id="undo-redo-toolbar">
      <i class="icon iconfont">&#xebbd;</i>
      <i class="icon iconfont">&#xeb83;</i>
    </div>
    <a-divider type="vertical" style="background-color: rgba(245, 245, 245, 100)"/>
    <div id="dataset-toolbar">
      <div class="header-title">Datasets:</div>
      <div id="dataset-select">
        <a-select
          placeholder="Select Example Data"
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
      <a-button
        class="header-button"
        style="width: 62px"
        @click="importDataset"
        id="chooseFile"
        >Import</a-button
      >
      <a-button
        class="header-button"
        style="width: 95px"
        @click="importNewData"
        id="chooseFile"
        >Import New</a-button
      >
    </div>
    <a-divider type="vertical" style="background-color: rgba(245, 245, 245, 100)"/>
    <div id="associate-toolbar">
      <div class="header-title">Associate:</div>
      <a-radio-group v-model="value" @change="onChangeMode" default-value="union" >
        <a-radio-button class="header-button" style="width: 125px" value="union"
          >Union(Outer Join)</a-radio-button
        >
        <a-radio-button class="header-button" style="width: 160px" value="intersect"
          >Intersection(Inner Join)</a-radio-button
        >
      </a-radio-group>
    </div>
    <!-- <div id="manipulate-toolbar">
      <a-button class="header-button" style="width: 100px">Manipulate</a-button>
    </div> -->
  </div>
</template>
<script>
import { mapActions } from "vuex";
import Utils from "@/utils.js";
import { EXAMPLE_DATA } from "@/CONSTANT";
export default {
  name: "HeaderView",
  data() {
    return {
      selectedValue: null,
      value: "union"
    };
  },
  computed: {
    EXAMPLE_DATA() {
      return EXAMPLE_DATA;
    },
  },
  methods: {
    ...mapActions(["storeRelation", "storeAttrInfo", "storeRawRelation", "storeAssociationRule"]),
    onChangeMode(){
      // console.log(this.value);
      this.storeAssociationRule(this.value);
    },
    handleChange(value) {
      if(!value || value === ""){
        Object.assign(this, {
          selectedValue: null
        });
        return;
      }
      let res = JSON.parse(value);
      // console.log(res);
      Object.assign(this, {
        selectedValue: res
      })
    },
    async importDataset() {
      if(!this.selectedValue) {
        this.$message.error("Please select a dataset");
        return;
      }
      try{
        // console.log(this.selectedValue.value);
        this.importData(JSON.stringify(this.selectedValue.value));
      } catch(e) {
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
          });
        });
        console.log("attrInfo:", attrInfo);
        this.storeAttrInfo(attrInfo);
        this.storeRawRelation(jsonData);
      } catch (e) {
        console.log(e);
        this.$message.error("Unsupported File Type");
      }
    },
  },
};
</script>

<style scoped>
.header-view {
  height: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

#rigel-title {
  display: inline-block;
  margin-left: 42px;
  width: 57px;
  color: rgba(16, 16, 16, 100);
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.75rem;
  letter-spacing: 0;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
}

#dataset-toolbar {
  display: inline-block;
  margin-left: 30px;
  margin-right: 30px;
}

#dataset-select {
  display: inline-block;
  margin-left: 15px;
  width: 200px;
}

.header-button {
  display: inline-block;
  margin-left: 10px;
  text-align: center;
  padding: 0;
}

.icon {
  font-size: 16px !important;
  width: 15px;
  height: 18px;
  margin-left: 6px;
  margin-right: 6px;
}

.header-title {
  display: inline-block;
  color: rgba(16, 16, 16, 100);
  font-size: 16px;
  text-align: left;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
}

#undo-redo-toolbar {
  display: inline-block;
  margin-left: 30px;
  margin-right: 30px;
}

#associate-toolbar {
  display: inline-block;
  margin-left: 30px;
}

#manipulate-toolbar {
  display: inline-block;
}
</style>