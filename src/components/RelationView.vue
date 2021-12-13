<template>
  <div class="view relation-view">
    <div class="view-title">Relations</div>
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
        :key="`${attr.tableName}_${attr.attrName}_${index}`"
      >
        <div class="attrInfo-block" :style="{'background-color': attr.color }">  </div>
        <div class="attrInfo-text">{{ attr.attrName }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Spreadsheet from "./Spreadsheet/Index.vue";

export default {
  name: "RelationView",
  computed: 
    mapState({
      relations: state => state.relations,
      attrInfo: state => state.attrInfo
    }),
  methods: {
    ...mapMutations(["changeActivatedRelationIndex", "removeRelationByIndex"]),
    onTabChange(targetIndex) {
      this.changeActivatedRelationIndex(targetIndex);
    },
    onTabEdit(targetIndex, action) {
      if (action == "remove") {
        this.removeRelationByIndex(targetIndex);
      }
    },
  },
  components: {
    Spreadsheet,
  },
};
</script>

<style scoped>
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
}

.attrInfo-container .attrInfo-text {
  line-height: 20px;
  height: 20px;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
  display: inline-block;
  margin-left: 9px;
}

.relations-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
</style>
