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
      <div class="suggestion-unit" v-if="this.alterSpecList.length > 0">
        <div class="suggestionTitle">
          Alternatives (Rearrangle current attributes)
        </div>
        <div class="alter-unit">
          <div
            v-for="(suggestion, i) in this.alterSpecList"
            :key="`top${i}`"
            class="alter-panel"
            @click="applySpec(suggestion)"
          >
            {{ suggestion.description }}
          </div>
        </div>
      </div>
      <div class="suggestion-unit" v-if="this.suggestions.length > 0">
        <div class="suggestionTitle">Variations (Add more attributes)</div>
        <div class="variation-unit">
          <Varunit :content="this.suggestions" />
        </div>
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
    return {
      // testcontent: [
      //   {
      //     add: "union(a,b)", // string
      //     list: [
      //       {
      //         // spec数组
      //         row_header: null,
      //         column_header: null,
      //         body: null,
      //         description: "(a), (b) => (c)",
      //       },
      //     ],
      //   },
      // ],
    };
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
      try {
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
      } catch (err) {
        this.$message.error("Illegal specification!");
      }
    },
  },
  components: {
    Varunit,
  },
};
</script>

<style scoped>
.suggestion-view {
  width: 100%;
  height: calc(100% - 20px);
  overflow: hidden;
}

.suggestion-container {
  min-height: 50px;
  margin: 20px 0 auto 0;
  border-radius: 4px;
  border: 1px solid rgba(187, 187, 187, 100);
  background: white;
  overflow: hidden;
}

.suggestion-container .ant-collapse {
  min-width: 0px;
  font: 400 18px/24px Times;
  text-align: left;
}

.suggestion-unit {
  margin: 25px 20px 40px 20px;
}

.alter-unit::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.alter-unit {
  height: 220px;
  overflow: scroll;
}

.alter-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #eaebee;
  padding: 5px 0px 5px 7px;
  margin-bottom: 3px;
}

.alter-panel:hover {
  background-color: #d8d5d5;
}

.variation-unit {
  height: 250px;
  overflow: scroll;
}

.variation-unit::-webkit-scrollbar {
  display: none;
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
