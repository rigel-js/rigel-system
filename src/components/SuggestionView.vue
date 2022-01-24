<template>
  <div class="view suggestion-view">
    <div class="view-title">Suggestions</div>
    <div class="suggestion-container">
      <div v-if="this.alterSpecList.length > 0" class="suggestionTitle">
        Alternatives (Rearrangle current attributes)
        <a-collapse defaultActiveKey="top0">
          <a-collapse-panel
            v-for="(suggestion, i) in this.alterSpecList"
            :key="`top${i}`"
            :header="suggestion.description"
          >
            <a-button @click="applySpec(suggestion)">Apply</a-button>
          </a-collapse-panel>
        </a-collapse>
      </div>
      <a-collapse defaultActiveKey="top0">
        <a-collapse-panel
          v-for="(suggestion, i) in suggestions"
          :key="`top${i}`"
          :header="suggestion.description"
        >
          <!-- <a-collapse defaultActiveKey="middle0">
            <a-collapse-panel
              v-for="(subsuggestion, j) in suggestion.children"
              :key="`middle${j}`"
              :header="subsuggestion.description"
            >
              <div
                class="suggestion"
                @click="onSuggestionClick(subsuggestion)"
                :title="`${subsuggestion.rowNum} rows ${subsuggestion.colNum} columns`"
              >
                <span class="spec">{{ subsuggestion.spec }}</span>
                <span class="meta-data">{{
                  `${subsuggestion.rowNum} rows ${subsuggestion.colNum} columns`
                }}</span>
              </div>
            </a-collapse-panel>
          </a-collapse> -->
          <!-- {{ suggestion.description }} -->
          <a-button @click="applySpec(suggestion)">Apply</a-button>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { transform } from "rigel-tools";

export default {
  name: "SuggestionView",
  computed: mapState(["relations", "suggestions", "rawRelations", "alterSpecList"]),
  methods: {
    ...mapActions(["storeSuggestedTable"]),
    onSuggestionClick(suggestion) {
      // apply the suggestion
      console.log(suggestion);
    },
    applySpec(spec) {
      // console.log(JSON.stringify(spec));
      // console.log(this.relations);
      let sch = {
        data: this.rawRelations,
        target_table: [spec],
      };
      console.log(sch);
      let res = transform(sch)[0];
      // console.log(res);
      for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].length; j++) {
          if (res[i][j]) {
            let tmp = {};
            tmp.source = spec["row_header"];
            tmp.value = res[i][j].value ? res[i][j].value : res[i][j];
            res[i][j] = tmp;
          }
        }
      }
      // console.log(res);
      this.storeSuggestedTable(res);
    },
  },
};
</script>

<style scoped>
.suggestion-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.suggestion-container {
  height: calc(100% - 76px);
  overflow: scroll;
  margin: 20px 0 5px 0;
}

.suggestion-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.suggestion-container .ant-collapse {
  min-width: 0px;
  font: 400 18px/24px Times;
  text-align: left;
}

.suggestion-container .suggestion {
  /* 这种写法不太行，322 magic number，勉强用用吧 */
  /* width: 100%; */
  width: 322px;
  height: 24px;
  cursor: pointer;
  white-space: nowrap;
  /* text-overflow: ellipsis; */
  overflow: scroll;
}

.suggestion-container .suggestion::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.suggestion-container .suggestion .spec {
  /* font-weight: bold; */
  padding-right: 20px;
}

.suggestion-container .suggestion .meta-data {
  color: #aaa;
}

.suggestionTitle {
  font-size: 15px;
}
</style>
