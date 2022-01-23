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
              :id="`spec_row_${index}_${JSON.stringify(item)}`"
              class="specitem"
              :draggable="true"
              :data-info="JSON.stringify(item)"
              @dragstart="dragstartHandler"
            >
              <div class="spectext">
                {{
                  item.data
                    ? `${item.data}.${item.attribute}`
                    : `${item.attribute}`
                }}
              </div>
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
              :id="`spec_column_${index}_${JSON.stringify(item)}`"
              class="specitem"
              :draggable="true"
              :data-info="JSON.stringify(item)"
              @dragstart="dragstartHandler"
            >
              <div class="spectext">
                {{
                  item.data
                    ? `${item.data}.${item.attribute}`
                    : `${item.attribute}`
                }}
              </div>
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
              :id="`spec_body_${index}_${JSON.stringify(item)}`"
              class="specitem"
              :draggable="true"
              :data-info="JSON.stringify(item)"
              @dragstart="dragstartHandler"
            >
              <div class="spectext">
                {{
                  item.data
                    ? `${item.data}.${item.attribute}`
                    : `${item.attribute}`
                }}
              </div>
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
      row_header: [],
      // row_header: [
      //   {
      //     attribute: "state",
      //     color: "rgb(243,26,244,0.4)",
      //     data: "crime",
      //     strName: {
      //       attribute: "state",
      //       data: "crime",
      //       operator: "attr",
      //     },
      //     valueList: ["Alabama", "Alaska"],
      //   },
      // ],
      column_header: [],
      body: [],
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
      sessionStorage.setItem("type", "spec");
      sessionStorage.setItem("id", event.target.id);
    },
    dragoverHandler(event) {
      let type = sessionStorage.getItem("type");
      if (type == "spec" || type == "attr") {
        event.preventDefault();
      } else {
        return;
      }
      let pre = sessionStorage.getItem("info"),
        current = event.target;
      let preItem = JSON.parse(pre);
      let preNode = document.getElementById(sessionStorage.getItem("id"));
      if (!preNode || preNode == current) return;

      let sourceList, targetList, sourceIndex, targetIndex;
      console.log(type);
      if (type == "attr") {
        sessionStorage.setItem("type", "spec");
      } else {
        sourceList = this.checkListType(preNode.parentNode);
        sourceIndex = this._index(preNode);
      }

      if (current.className == "specinput") {
        if (
          current.lastChild &&
          event.clientX <= current.lastChild.getBoundingClientRect().right
        ) {
          return;
        }
        targetList = this.checkListType(current);
        targetIndex =
          sourceList == targetList ? targetList.length - 1 : targetList.length;
      } else {
        targetList = this.checkListType(current.parentNode);
        targetIndex = this._index(current);
      }

      console.log(sourceList, targetList);
      if (type == "attr") {
        if (current.className == "specinput") {
          targetList.push(preItem);
        } else {
          targetList.splice(targetIndex, 0, preItem);
        }
      } else {
        if (current.className == "specinput") {
          sourceList.splice(sourceIndex, 1);
          targetList.push(preItem);
        } else {
          sourceList.splice(sourceIndex, 1);
          targetList.splice(targetIndex, 0, preItem);
        }
      }

      this.$forceUpdate();
      let listId = (current.className == "specinput") ? this.listToId(current) : this.listToId(current.parentNode);
      let newId = `spec_${listId}_${targetIndex}_${pre}`;
      sessionStorage.setItem("id", newId);
      console.log(newId);

      // let pre = sessionStorage.getItem("info");
      // let dragging = document.getElementById(type + "_" + pre),
      //   current = event.target;
      // if (dragging != current) {
      //   if (type == "attr") {
      //     console.log("ok");
      //     let item = JSON.parse(dragging.dataset.info);
      //     let newItem = this.$createElement(
      //       "div",
      //       {
      //         class: "specitem",
      //         attrs: {
      //           id: "spec_" + dragging.dataset.info,
      //           draggable: true,
      //           "data-info": dragging.dataset.info,
      //         },
      //         on: {
      //           dragstart: this.dragstartHandler,
      //         },
      //       },
      //       [
      //         this.$createElement("div", {
      //           class: "spectext",
      //           domProps: {
      //             innerHTML: item.data
      //               ? `${item.data}.${item.attribute}`
      //               : `${item.attribute}`,
      //           },
      //         }),
      //       ]
      //     );
      //     console.log(newItem);
      //     console.log(newItem.className);
      //     sessionStorage.setItem("info", newItem.dataset.info);
      //     sessionStorage.setItem("type", "spec");
      //     if (current.className == "specinput") {
      //       current.appendChild(newItem);
      //       return;
      //     } else {
      //       current.parentNode.insertBefore(current, newItem);
      //       return;
      //     }

      //   } else {
      //     //specitem
      //     if (current.className == "specinput") {
      //       current.appendChild(dragging);
      //       return;
      //     }
      //     let preId = this._index(dragging),
      //       curId = this._index(current);
      //     console.log(preId, curId);
      //     if (preId < curId) {
      //       current.parentNode.insertBefore(dragging, current.nextSibling);
      //     } else {
      //       current.parentNode.insertBefore(dragging, current);
      //     }
      //   }
      // }
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
    checkListType(el) {
      let id = el.id;
      if (id == "rowinput") {
        return this.row_header;
      } else if (id == "columninput") {
        return this.column_header;
      } else if (id == "bodyinput") {
        return this.body;
      }
    },
    listToId(el) {
      let id = el.id;
      if (id == "rowinput") {
        return "row";
      } else if (id == "columninput") {
        return "column";
      } else if (id == "bodyinput") {
        return "body";
      }
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
