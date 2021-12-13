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
              :editable="false"
            ></spreadsheet>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Spreadsheet from "./Spreadsheet/Index.vue";

export default {
  name: "RelationView",
  computed: mapState(["relations"]),
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
  height: calc(100% - 76px);
  overflow: scroll;
  text-align: left;
  margin: 20px 0 5px 0;
}

.relations-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
</style>
