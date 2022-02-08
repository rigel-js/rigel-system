<template>
  <div v-if="this.finalContent">
    <Mycollapse>
      <Mycollapsepanel
        v-for="(item, index) in this.finalContent"
        :key="index"
        :header="`Add ${item.add}`"
      >
        <Mycollapse>
          <Mycollapsepanel
            v-for="(spec, index2) in item.list"
            :key="index2"
            :header="spec.description"
            :applySpec="spec"
          >
            <div class="applypanel" @click="handleApply(spec)">Apply</div>
            <Mycollapse>
              <Mycollapsepanel
                header="Alternatives (Rearrange current attributes)"
              >
                <alterpanel :spec="spec"/>
              </Mycollapsepanel>
              <Mycollapsepanel
                header="Variations (Add more attributes)"
                :spec="spec"
              >
              </Mycollapsepanel>
            </Mycollapse>
          </Mycollapsepanel>
        </Mycollapse>
      </Mycollapsepanel>
    </Mycollapse>
  </div>
</template>

<script>
import Utils from "@/utils.js";
import { mapState, mapActions } from "vuex";
import alterpanel from "../alterpanel/Index.vue";
import { transform } from "rigel-tools";
export default {
  name: "Varunit",
  props: {
    content: {
      type: Array,
      default: null,
    },
    spec: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      newContent: null,
      alterSuggestion: [],
    };
  },
  computed: {
    ...mapState(["attrInfo", "rawRelations"]),
    finalContent() {
      if (this.content) return this.content;
      return this.newContent;
    },
  },
  mounted() {
    if (!this.content && this.spec) {
      this.newContent = this.calcExplore(this.spec);
    }
  },
  methods: {
    ...mapActions(["storeSuggestedTable", "storeNewSpec"]),
    calcExplore(spec) {
      // calculation
      try {
        let row_header = Utils.specObj2List(spec.row_header);
        let column_header = Utils.specObj2List(spec.column_header);
        let body = Utils.specObj2List(spec.body);
        console.log(row_header);
        let exploreSpec = Utils.genExploreSpec(
          row_header,
          column_header,
          body,
          this.attrInfo
        );
        return exploreSpec;
      } catch (err) {
        console.log(err.message);
        this.$message.error(err.message);
      }
      // return ([
      //   {
      //       "add": "union(a,b)",  // string
      //       "list": [
      //           {   // spec数组
      //               "row_header": null,
      //               "column_header": null,
      //               "body": null,
      //               "description": "(a), (b) => (c)",
      //           },
      //       ]
      //   }
      // ]);
    },
    handleApply(spec) {
      if (!spec) return;
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
    alterpanel
  },
};
</script>

<style scoped>
.applypanel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #eaebee;
  padding: 5px 0px 5px 7px;
  margin-bottom: 3px;
}
.applypanel:hover {
  background-color: #d8d5d5;
}
</style>
