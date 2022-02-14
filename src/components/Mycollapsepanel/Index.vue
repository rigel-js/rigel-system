<template>
  <r-collapse-panel class="collapse-demo-panel">
    <template slot="fixed">
      <div class="collapse-fixed" @click="this.handleClick">
        <div style="pointer-events: none">{{ this.header }}</div>
        <i class="icon iconfont" style="transition: all 0.3s">&#xe65b;</i>
      </div>
    </template>
    <!-- <div class="collapse-content">这是Panel 1的内容</div> -->
    <div class="collapse-content">
      <slot />
      <Varunit v-if="this.firstClick" :spec="this.spec" />
    </div>
  </r-collapse-panel>
</template>

<script>
import { RCollapse, RCollapsePanel } from "r-collapse-vue";

// import Varunit from "../Varunit/Index.vue";
export default {
  name: "Mycollapsepanel",
  props: {
    header: String,
    spec: {
      type: Object,
      default: undefined,
    },
    applySpec: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      activeKeys: [],
      firstClick: false,
    };
  },
  // watch: {
  //   spec(val, oldval) {
  //     if (val != oldval) {
  //       this.firstClick = false;
  //     }
  //   },
  // },
  methods: {
    handleChange(newActiveKeys, oldActiveKeys) {
      console.log("newActiveKeys", newActiveKeys);
      console.log("oldActiveKeys", oldActiveKeys);
    },
    handleClick(e) {
      console.log(e.target.lastChild);
      if (e.target.tagName == "I") {
        let className = e.target.className;
        let index = className ? className.indexOf("active") : -1;
        if (index != -1) {
          e.target.style.transform = "rotate(0)";
          let newstr = className.substr(0, index - 1);
          e.target.className = newstr;
        } else {
          e.target.style.transform = "rotate(180deg)";
          e.target.className += " active";
        }
      } else {
        let className = e.target.lastChild.className;
        let index = className ? className.indexOf("active") : -1;
        if (index != -1) {
          e.target.lastChild.style.transform = "rotate(0)";
          let newstr = className.substr(0, index - 1);
          e.target.lastChild.className = newstr;
        } else {
          e.target.lastChild.style.transform = "rotate(180deg)";
          e.target.lastChild.className += " active";
        }
      }
      this.firstClick = true;
      // e.stopPropagation();
    },
  },
  components: {
    // RCollapse,
    RCollapsePanel,
  },
};
</script>

<style lang="scss">
.collapse-demo-panel {
  .collapse-fixed {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #eaebee;
    padding: 5px 0px 5px 7px;
    margin-bottom: 3px;
    //   padding: 10px;
    // > i {
    // 	// font-size: 12px;
    // 	transform: scale(1);
    // 	transition: transform 0.3s;
    // }
  }
}
.collapse-content {
  padding: 5px 0px 5px 7px;
  text-align: left;
}

.icon {
  font-size: 14px !important;
  width: 15px;
  height: 18px;
  margin-right: 5px;
}
</style>