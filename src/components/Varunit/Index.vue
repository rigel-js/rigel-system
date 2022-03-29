<template>
  <div v-if="this.finalContent">
    <div
      v-for="(item, index) in this.finalContent"
      :key="JSON.stringify(item)+String(index)"
      class="applypanel"
      @click="handleApply(item.spec)"
      @mouseenter="previewSpec(item.spec)"
      @mouseleave="restorePreview"
    >
      <div class="applypanelcontent">
        <a-icon type="bulb" class="icon applypanelicon"/>
        <!-- <span class="applypaneltext"> {{ partialSpec.description }} </span> -->
        <colorattr :spec="`Add ${item.add}`" class="applypaneltext"/>
      </div>
    </div>
    <!-- <Newcollapse :level="level" :initial="0">
      <Newcollapsepanel
        v-for="(item, index) in this.finalContent"
        :key="index"
        :name="index"
        :header="`Add ${item.add}`"
        :level="level"
      >
        <Newcollapse :level="level+1" :initial="0">
          <Newcollapsepanel
            v-for="(spec, index2) in item.list"
            :key="index2"
            :name="index2"
            :header="spec.description"
            :applySpec="spec"
            :level="level+1"
          >
            <div
              class="applypanel"
              @click="handleApply(spec)"
              @mouseenter="previewSpec(spec)"
              @mouseleave="restorePreview"
            >
              <div class="applypanelcontent" :style="`padding-left:${7*level+21}px;`">
                <a-icon type="bulb" class="icon applypanelicon"/>
                <span class="applypaneltext"> Apply </span>
              </div>
            </div>
            <Newcollapse :level="level+2" :initial="0">
              <Newcollapsepanel
                header="Alternatives (Rearrange current attributes)"
                :name="0"
                :level="level+2"
              >
                <alterpanel :spec="spec" :level="level+2"/>
              </Newcollapsepanel>
              <Newcollapsepanel
                header="Variations (Add more attributes)"
                :name="1"
                :level="level+2"
              >
                <Varunit :spec="spec" :level="level+3"/>
              </Newcollapsepanel>
            </Newcollapse>
          </Newcollapsepanel>
        </Newcollapse>
      </Newcollapsepanel>
    </Newcollapse> -->
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
    level: {
      type: Number,
      default: 0,
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
  watch: {
    spec(val, oldval) {
      if(val != oldval) {
        this.newContent = this.calcExplore(val);
        this.$forceUpdate();
      }
    }
  },
  mounted() {
    if (!this.content && this.spec) {
      this.newContent = this.calcExplore(this.spec);
    }
  },
  methods: {
    ...mapActions(["storeCurrentTable", "storeCurrentState", "storePreviewTable", "storeGenRecommendation", "setSpec"]),
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
              tmp.source = res[i][j].source;
              tmp.value = typeof(res[i][j].value) != "undefined" ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        // console.log(res);
        this.storeCurrentTable(res);
        this.setSpec({
          row_header: Utils.specObj2List(spec["row_header"]),
          column_header: Utils.specObj2List(spec["column_header"]),
          body: Utils.specObj2List(spec["body"]),
        });
        this.storeGenRecommendation(true);
      } catch (err) {
        this.$message.error("Illegal specification!");
      }
    },
    previewSpec(spec) {
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
              tmp.source = res[i][j].source;
              tmp.value = typeof(res[i][j].value) != "undefined" ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        // console.log(res);
        this.storePreviewTable(res);
      } catch (err) {
        this.$message.error("Illegal specification!");
        throw err;
      }
    },
    restorePreview() {
      this.storePreviewTable(undefined);
    }
  },
  components: {
    alterpanel
  },
};
</script>