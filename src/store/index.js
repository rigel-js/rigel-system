import Vue from "vue";
import Vuex from "vuex";

import Utils from "@/utils.js";
import { EXTRACT_URL } from "@/CONSTANT";

Vue.use(Vuex);

const state = {
  activatedRelationIndex: -1,
  relations: [],
  attrInfo: [],
  suggestions: [],
  dragSourceIsCell: false
};

const mutations = {
  addRelation(state, relation) {
    // relation.name = `Relation ${state.relations.length + 1}`;
    state.relations.push(relation);

    if (state.relations.length === 1) {
      state.activatedRelationIndex = 0;
      // state.suggestions = Utils.generateSuggestions(relation, "");
    }
  },

  addAttrInfo(state, attrInfo) {
    state.attrInfo = state.attrInfo.concat(attrInfo);
  },

  changeActivatedRelationIndex(state, index) {
    state.activatedRelationIndex = index;
  },

  removeRelationByIndex(state, index) {
    state.relations.splice(index, 1);
    if (index <= state.activatedRelationIndex) {
      state.activatedRelationIndex--;
    }
  },

  mutateDragSource(state, isCell) {
    state.dragSourceIsCell = isCell;
  }
};

const actions = {
  async extractRelationFromRawData({ commit }, rawData) {
    const resp = await fetch(EXTRACT_URL, {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: `data=${rawData}`,
    });
    if (resp.ok) {
      const relation = await resp.json();
      commit("addRelation", relation);
    } else {
      throw new Error(resp.statusText);
    }
  },
  storeRelation({ commit }, relation) {
    commit("addRelation", relation);
  },
  storeAttrInfo({ commit }, attrInfo) {
    commit("addAttrInfo", attrInfo);
  },
  setDragSource({ commit }, isCell) {
    commit("mutateDragSource", isCell);
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
