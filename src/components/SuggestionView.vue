<template>
  <div class="view suggestion-view">
    <div class="view-title">Suggestions</div>
    <div class="suggestion-container">
      <div
        v-if="this.alterSpecList.length == 0 && this.suggestions.length == 0"
        class="suggestion-empty"
      >
        <a-empty style="padding-top: 10px" />
      </div>
      <div class="suggestion-unit">
        <div v-if="this.alterSpecList.length > 0">
          <div class="suggestionTitle">
            Alternatives (Rearrangle current attributes)
          </div>
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
      </div>
      <!-- <div class="suggestion-unit">
        <div v-if="this.suggestions.length > 0">
          <div class="suggestionTitle">Variations (Add more attributes)</div>
          <a-collapse defaultActiveKey="top0">
            <a-collapse-panel
              v-for="(suggestion, i) in suggestions"
              :key="`top${i}`"
              :header="suggestion.description"
            >
              <a-button @click="applySpec(suggestion)">Apply</a-button>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div> -->
      <div class="suggestion-unit">
        <Varunit :content="this.testcontent"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { transform } from "rigel-tools";
import Varunit from "./Varunit/Index.vue";

export default {
  name: "SuggestionView",
  data() {
    return ({
      testcontent: [
        {
            "add": "union(a,b)",  // string
            "list": [
                {   // spec数组
                    "row_header": null,
                    "column_header": null,
                    "body": null,
                    "description": "(a), (b) => (c)",
                },
            ]
        } 
      ]
    });
  },
  computed: mapState([
    "relations",
    "suggestions",
    "rawRelations",
    "alterSpecList",
  ]),
  methods: {
    ...mapActions(["storeSuggestedTable", "storeNewSpec"]),
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
      try{
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
        this.storeNewSpec(spec);
      } catch(err) {
        this.$message.error("Illegal specification!");
      }
    },
  },
  components: {
    Varunit
  }
};
</script>

<style scoped>
.suggestion-view {
  width: 100%;
  height: calc(100% - 76px);
  overflow: hidden;
}

.suggestion-container {
  min-height: 50px;
  overflow: scroll;
  margin: 20px 0 auto 0;
  border-radius: 4px;
  border: 1px solid rgba(187, 187, 187, 100);
  background: white;
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

.suggestion-unit {
  margin: 25px 20px 40px 20px;
}

.suggestion-empty {
  margin: 25px 20px 25px 20px;
}

.suggestionTitle {
  font-size: 15px;
  margin-bottom: 15px;
  font-weight: bold;
}

.collapse-unit {
  margin: 5px 9px 5px 9px;
  width: calc(100% - 18px);
}
</style>
