<template>
  <r-collapse
    v-model="activeKeys"
    class="collapse-demo"
    activeClass="collapse-demo-active"
    @change="handleChange"
  >
    <slot/>
  </r-collapse>
</template>

<script>
import { RCollapse, RCollapsePanel } from "r-collapse-vue";
export default {
  name: "Mycollapse",
  props: {
    header: String
  },
  data() {
    return {
      activeKeys: [],
    };
  },
  methods: {
    handleChange(newActiveKeys, oldActiveKeys) {
      console.log("newActiveKeys", newActiveKeys);
      console.log("oldActiveKeys", oldActiveKeys);
    },
  },
  components: {
    RCollapse,
  },
};
</script>

<style lang="scss">
.collapse-demo {
  width: 100%;
  cursor: pointer;
  // .collapse-demo-panel.collapse-demo-active {
  //   .collapse-fixed > i {
  //     transform: rotate(180deg) !important;
  //   }
  // }
}
</style>