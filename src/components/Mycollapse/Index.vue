<template>
  <r-collapse
    v-model="activekeys"
    class="collapse-demo"
    activeClass="collapse-demo-active"
    @change="handlechange"
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
      activekeys: [],
    };
  },
  methods: {
    handlechange(newActiveKeys, oldActiveKeys) {
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