<template>
  <div class="collapse-panel" :class="status ? activeClass : ''">
    <div class="collapse-panel-fixed" @click="handleFixedClick" :style="`padding-left:${7*level+7}px;`">
      <!-- @slot 固定头部，是一个作用域插槽，可提供toggle、open、close方法 -->
      <i 
        class="icon iconfont" 
        style="transition: all 0.3s; color: #b3b3b3"
        :style="level == 0 && name == 0 ? '' : 'transform: rotate(-90deg)'"
        :class="level == 0 && name == 0 ? 'active' : ''"
      >&#xe60a;
      </i>
      <div style="pointer-events: none; margin-left: 8px;">{{ header }}</div>
    </div>
    <transition
      @before-enter="beforeEnter"
      @enter="enter"
      @afterEnter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div v-if="status" class="collapse-panel-content">
        <!-- @slot 自定义可伸缩内容的区域 -->
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "Newcollapsepanel",
  props: {
    name: {
      type: [String, Number],
      required: true,
    },
    defaultClickAction: {
      type: Boolean,
      default: true,
    },
    header: String,
    level: {
			type: Number,
			default: 0,
		},
  },
  data() {
    return {
      parent: null,
    };
  },
  computed: {
    innerName() {
      // return this.name ? this.name : Math.random().toString(32).substr(2);
      return this.name;
    },
    activeKeys() {
      if (this.parent) {
        return this.parent.value;
      }
      return [];
    },
    activeClass() {
      if (this.parent) {
        return this.parent.activeClass;
      }
      return "collapse-panel-active";
    },
    status() {
      // return this.activeKeys.includes(this.innerName);
      if (!this.activeKeys) return false;
      for (let i = 0; i < this.activeKeys.length; i++) {
        if (this.activeKeys[i] == this.innerName) return true;
      }
      return false;
    },
  },
  mounted() {
    // 获取Collapse的实例
    let p = this.$parent;
    while (p) {
      if (p && p.$options.name !== "Newcollapse") {
        p = p.$parent;
      } else {
        this.parent = p;
        return;
      }
    }
  },
  methods: {
    handleFixedClick(e) {
      console.log("click");
      console.log(e.target.firstChild);
      if (e.target.tagName == "I") {
        let className = e.target.className;
        let index = className ? className.indexOf("active") : -1;
        if (index != -1) {
          e.target.style.transform = "rotate(-90deg)";
          let newstr = className.substr(0, index - 1);
          e.target.className = newstr;
        } else {
          e.target.style.transform = "rotate(0)";
          e.target.className += " active";
        }
      } else {
        let className = e.target.firstChild.className;
        let index = className ? className.indexOf("active") : -1;
        if (index != -1) {
          e.target.firstChild.style.transform = "rotate(-90deg)";
          let newstr = className.substr(0, index - 1);
          e.target.firstChild.className = newstr;
        } else {
          e.target.firstChild.style.transform = "rotate(0)";
          e.target.firstChild.className += " active";
        }
      }
      if (this.defaultClickAction) {
        this.toggle();
      }
    },
    toggle() {
      // console.log("toggle");
      if (this.status) {
        this.close();
      } else {
        this.open();
      }
    },
    open() {
      // this.dispatch('RCollapse', 'r.collapse.open', [this.innerName]);
      this.$parent.$emit("open", this.innerName);
    },
    close() {
      // this.dispatch('RCollapse', 'r.collapse.close', [this.innerName]);
      this.$parent.$emit("close", this.innerName);
    },
    beforeEnter(el) {
      el.style.height = "0";
    },
    enter(el) {
      el.style.height = this.getContentHeihgt(el);
    },
    afterEnter(el) {
      el.style.height = "";
    },
    beforeLeave(el) {
      el.style.height = this.getContentHeihgt(el);
    },
    beforeLeave(el) {
      el.style.height = this.getContentHeihgt(el);
    },
    leave(el) {
      // 修复before-leave与leave在同一帧中被修改height导致无动画
      setTimeout(() => {
        el.style.height = "0";
      }, 0);
    },
    afterLeave(el) {
      el.style.height = "";
    },
    getContentHeihgt(el) {
      if (el.scrollHeight) {
        return el.scrollHeight + "px";
      }
      return "";
    },
  },
};
</script>

<style lang="scss" scoped>
.collapse-panel {
  .collapse-panel-content {
    overflow: hidden;
    transition: height 0.3s;
    text-align: left;
  }
}

.collapse-panel {
  .collapse-panel-fixed {
    display: flex;
    align-items: center;
    justify-content: left;
    // background-color: #eaebee;
    // border-left-width: 10px;
    // border-left-style: solid;
    // border-left-color:#eaebee;
    border: 1px solid #eaebee;
    padding: 7px 0px 7px 7px;
    //   padding: 10px;
    // > i {
    // 	// font-size: 12px;
    // 	transform: scale(1);
    // 	transition: transform 0.3s;
    // }
  }
}

.iconclass {
  transform: rotate(-90deg);
}
</style>

