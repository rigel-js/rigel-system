<template>
  <div class="header-view">
    <div id="rigel-title">Rigel</div>
    <div id="undo-redo-toolbar">
      <i class="icon iconfont" style="color: white; cursor: pointer;" @click="handleUndo">&#xebbd;</i>
      <i class="icon iconfont" style="color: white; cursor: pointer;" @click="handleRedo">&#xeb83;</i>
    </div>
    
    
  </div>
</template>
<script>
import { mapActions } from "vuex";
import Utils from "@/utils.js";
import { EXAMPLE_DATA } from "@/CONSTANT";
export default {
  name: "HeaderView",
  methods: {
    ...mapActions(["undo", "redo"]),
    handleUndo() {
      this.undo();
    },
    handleRedo() {
      this.redo();
    }
  },
};
</script>

<style scoped>
.header-view {
  height: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

#rigel-title {
  display: inline-block;
  margin-left: 27px;
  width: 57px;
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.75rem;
  letter-spacing: 0;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
}



.header-button {
  display: inline-block;
  margin-left: 10px;
  text-align: center;
  padding: 0;
}

.icon {
  font-size: 16px !important;
  width: 15px;
  height: 18px;
  margin-left: 6px;
  margin-right: 6px;
}

.header-title {
  display: inline-block;
  color: rgba(16, 16, 16, 100);
  font-size: 16px;
  text-align: left;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
}

#undo-redo-toolbar {
  display: inline-block;
  margin-left: 30px;
  margin-right: 30px;
}

#associate-toolbar {
  display: inline-block;
  margin-left: 30px;
}
</style>