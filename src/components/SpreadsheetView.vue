<template>
  <div class="view spreadsheet-view">
    <div class="view-title">Target Table</div>
    <div class="spreadsheet-container">
      <spreadsheet
        name="targetTable"
        :initRowNum="15"
        :initColNum="8"
        :editable="true"
        :table="this.suggestedTable"
        :key="JSON.stringify(this.suggestedTable)"
      ></spreadsheet>
      <div class="specmenu">
        <div class="speccomponent">
          <div class="spectitle">Row header:</div>
          <div
            class="specinput"
            id="rowinput"
            @dragover="dragoverHandler"
            @drop="dropHandler"
          >
            <div
              v-for="(item, index) in this.row_header"
              :key="`row_${index}`"
              :id="`row_${index}`"
              class="specitem"
              :draggable="true"
              :data-info="`row_${index}`"
              @dragstart="dragstartHandler"
            >
              <div class="spectext">{{ item }}</div>
            </div>
          </div>
        </div>
        <div class="speccomponent">
          <div class="spectitle">Column header:</div>
          <div
            class="specinput"
            id="columninput"
            @dragover="dragoverHandler"
            @drop="dropHandler"
          >
            <div
              v-for="(item, index) in this.column_header"
              :key="`column_${index}`"
              :id="`column_${index}`"
              class="specitem"
              :draggable="true"
              :data-info="`column_${index}`"
              @dragstart="dragstartHandler"
            >
              <div class="spectext">{{ item }}</div>
            </div>
          </div>
        </div>
        <div class="speccomponent">
          <div class="spectitle">Body:</div>
          <div
            class="specinput"
            id="bodyinput"
            @dragover="dragoverHandler"
            @drop="dropHandler"
          >
            <div
              v-for="(item, index) in this.body"
              :key="`body_${index}`"
              :id="`body_${index}`"
              class="specitem"
              :draggable="true"
              :data-info="`body_${index}`"
              @dragstart="dragstartHandler"
            >
              <div class="spectext">{{ item }}</div>
            </div>
          </div>
        </div>
        <div class="spectoolbar">
          <a-button type="primary" class="specbutton">Apply</a-button>
          <a-button class="specbutton">Reset</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Spreadsheet from "./Spreadsheet/Index.vue";
import { mapActions, mapState } from "vuex";

export default {
  name: "SpreadsheetView",
  data() {
    return {
      row_header: ["crime", "year"],
      column_header: ["apple", "pear"],
      body: ["orange", "banana", "set"],
    };
  },
  computed: {
    ...mapState(["suggestedTable"]),
  },
  methods: {
    onInput(event) {
      console.log(event);
    },
    dragstartHandler(event) {
      // event.dataTransfer.setData("info", event.target.dataset.info);
      sessionStorage.setItem("info", event.target.dataset.info);
    },
    dragoverHandler(event) {
      event.preventDefault();
      let pre = sessionStorage.getItem("info");
      let dragging = document.getElementById(pre),
        current = event.target;
      if (dragging != current) {
        if (current.className == "specinput") {
          current.appendChild(dragging);
          return;
        }
        let preId = this._index(dragging),
          curId = this._index(current);
        console.log(preId, curId);
        if (preId < curId) {
          current.parentNode.insertBefore(dragging, current.nextSibling);
        } else {
          current.parentNode.insertBefore(dragging, current);
        }
      }
    },
    dropHandler(event) {
      event.preventDefault();
      console.log("drop");
    },
    _index(el) {
      var index = 0;
      if (!el || !el.parentNode) {
        return -1;
      }
      while (el && (el = el.previousElementSibling)) {
        index++;
      }
      return index;
    },
  },
  components: {
    Spreadsheet,
  },
};
</script>

<style scoped>
.spreadsheet-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.spreadsheet-container {
  height: 100%;
  min-width: 500px;
  overflow: scroll;
  margin: 20px 0 5px 0;
}

.spreadsheet-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.specmenu {
  text-align: left;
  margin-top: 50px;
  vertical-align: center;
}

.speccomponent {
  margin-bottom: 21px;
}

.spectitle {
  display: inline-block;
  margin-right: 10px;
  /* margin-bottom: 15px; */
  height: 27px;
  width: 100px;
  text-align: right;
}

.specinput {
  background: white;
  display: inline-block;
  min-height: 28px;
  width: 350px;
  margin-bottom: -9px;
  border-radius: 4px;
  border: 1px solid rgba(187, 187, 187, 100);
}

.specinput::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.specitem {
  border-radius: 4px;
  border: 1px solid;
  height: 20px;
  margin: 2px 3px 2px 3px;
  padding-left: 3px;
  padding-right: 3px;
  display: inline-block;
}

.spectext {
  user-select: none;
  pointer-events: none;
}

.specbutton {
  width: 52px;
  height: 26px;
  padding: 0px 2px 0px 2px;
  margin: auto 7px auto 7px;
  text-align: center;
  display: inline-block;
}

.spectoolbar {
  vertical-align: center;
  text-align: center;
  margin: 7px auto 50px;
}
</style>
