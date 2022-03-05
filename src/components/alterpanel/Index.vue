<template>
  <div>
    <div
      v-for="(suggestion, index3) in this.alterSuggestion"
      :key="index3"
      class="applypanel"
      @click="handleApply(suggestion)"
      @mouseenter="previewSpec(suggestion)"
      @mouseleave="restorePreview"
    >
      <div class="applypanelcontent">
        <a-icon type="bulb" class="icon applypanelicon"/>
        <span class="applypaneltext"> {{ suggestion.description }} </span>
      </div>
    </div>
  </div>
</template>

<script>
import Utils from "@/utils.js";
import { mapState, mapActions } from "vuex";
import { transform } from "rigel-tools";
export default {
  name: "alterpanel",
  props: {
    spec: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      alterSuggestion: [],
    };
  },
  computed: {
    ...mapState(["rawRelations", "canSuggest"]),
  },
  mounted() {
    if (this.spec) {
			let spec = this.spec;
      let row_header = Utils.specObj2List(spec.row_header);
      let column_header = Utils.specObj2List(spec.column_header);
      let body = Utils.specObj2List(spec.body);
      try {
        let alterSuggestion = Utils.genAlterSpec(
          row_header,
          column_header,
          body
        );
        this.alterSuggestion = alterSuggestion;
      } catch (err) {
        console.log(err.message);
        this.$message.error(err.message);
      }
    }
  },
  watch: {
    spec(val, oldval) {
      if(val != oldval) {
        if (this.spec) {
          let spec = this.spec;
          let row_header = Utils.specObj2List(spec.row_header);
          let column_header = Utils.specObj2List(spec.column_header);
          let body = Utils.specObj2List(spec.body);
          try {
            let alterSuggestion = Utils.genAlterSpec(
              row_header,
              column_header,
              body
            );
            this.alterSuggestion = alterSuggestion;
          } catch (err) {
            console.log(err.message);
            this.$message.error(err.message);
          }
        }
      }
    }
  },
  methods: {
    ...mapActions(["storeCurrentTable", "storeNewSpec", "storeCanSuggest", "storeCurrentState", "restoreCurrentState"]),
    handleApply(spec, isPreview) {
      if (!spec) return;
      if(!isPreview) {
        if(!this.canSuggest) {
          this.restoreCurrentState();
        }
        this.storeCanSuggest(true);
      }
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
              tmp.value = res[i][j].value ? res[i][j].value : res[i][j];
              res[i][j] = tmp;
            }
          }
        }
        // console.log(res);
        this.storeCurrentTable(res);
        this.storeNewSpec(spec);
      } catch (err) {
        this.$message.error("Illegal specification!");
      }
    },
    previewSpec(spec) {
      this.storeCurrentState();
      this.storeCanSuggest(false);
      this.handleApply(spec, true);
    },
    restorePreview() {
      if(!this.canSuggest) {
        this.restoreCurrentState();
      }
    }
  },
};
</script>