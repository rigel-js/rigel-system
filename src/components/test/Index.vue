<template>
  <div>
      <slot name="abc" :test="this.test"/>
  </div>
</template>

<script>

// import Varunit from "../Varunit/Index.vue";
export default {
  name: "test",
  props: {

  },
  data() {
    return {
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
    test(){
      console.log("233");
    }
  },
  components: {
  },
};
</script>

<style lang="scss" scoped>
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