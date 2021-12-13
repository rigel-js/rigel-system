<template>
    <div class="header-view">
        <div id="rigel-title">Rigel</div>
        <div id="dataset-toolbar">
          <div class="header-title">Datasets:</div>
          <div id="dataset-select">
            <a-select
              placeholder="Select Example Data"
              style="width:100%"
              :allowClear="true"
              @change="loadExampleData"
            >
              <a-select-option
                v-for="data in EXAMPLE_DATA"
                :key="data.id"
                :value="data.id"
              >
                {{ data.name }}
              </a-select-option>
            </a-select>
          </div>
          <a-button class="header-button" style="width:62px" @click="importData" id="chooseFile">Import</a-button>
        </div>
        <div id="undo-redo-toolbar">
          <a-button class="header-button" style="width:62px">Undo</a-button>
          <a-button class="header-button" style="width:62px">Redo</a-button>
        </div>
        <div id="associate-toolbar">
          <div class="header-title">Associate:</div>
          <a-button class="header-button" style="width:125px">Union(Outer Join)</a-button>
          <a-button class="header-button" style="width:160px">Intersection(Inner Join)</a-button>
        </div>
        <div id="manipulate-toolbar">
          <a-button class="header-button" style="width:100px">Manipulate</a-button>
        </div>
    </div>
</template>
<script>
import { mapActions } from "vuex";
import Utils from "@/utils.js";
export default {
  name: "HeaderView",
  data() {
    return {
    };
  },
  methods: {
    ...mapActions(["storeRelation", "storeAttrInfo"]),
    async selectData() {
      return new Promise((resolve, reject) => {
        let input = document.createElement('input');
        input.value = 'select file';
        input.type = 'file';
        input.onchange = event => {
            let file = event.target.files[0];
            let file_reader = new FileReader();
            file_reader.onload = () => {
                let fc = file_reader.result;
                resolve(fc); // 返回文件文本内容到Promise
            };
            file_reader.readAsText(file, 'UTF-8');
        };
        input.click();
      });
    },
    async importData() {
      let rawData = await this.selectData();
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
            newItem.push(item[key]);
          })
          relation.push(newItem);
        })
        let colorList = Utils.genRandomColor(keys.length);
        console.log("color", colorList)
        let res = {
          name: jsonData.name,
          entityOrder: keys,
          relation: relation,
          color: colorList
        };
        console.log("res: ", res);
        this.storeRelation(res);
        let attrInfo = [];
        keys.forEach((key, index) => {
          let valueList = [];
          jsonData.values.forEach((item) => {
            valueList.push(item[index]);
          })
          attrInfo.push({
            tableName: jsonData.name,
            attrName: key,
            color: colorList[index],
            valueList: valueList
          });
        })
        console.log("attrInfo:", attrInfo)
        this.storeAttrInfo(attrInfo);
      } catch(e) {
        console.log(e);
        this.$message.error("Unsupported File Type");
      }
    }
  }
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
  width: 37px;
  color: rgba(16, 16, 16, 100);
  font-size: 16px;
  font-family: SourceHanSansSC-regular;
}

#dataset-toolbar {
  display: inline-block;
  margin-left: 126px;
  width: 400px;
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

.header-title {
  display: inline-block;
  color: rgba(16, 16, 16, 100);
  font-size: 16px;
  text-align: left;
  font-family: SourceHanSansSC-regular;
}

#undo-redo-toolbar {
  display: inline-block;
  margin-left: 200px;
  width: 150px;
}

#associate-toolbar {
  display: inline-block;
  margin-left: 180px;
  width: 400px;
}

#manipulate-toolbar {
  display: inline-block;
  float: right;
  margin-right: 30px;
}
</style>