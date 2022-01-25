import Vue from "vue";
import Vuex from "vuex";

import Utils from "@/utils.js";
import { EXTRACT_URL } from "@/CONSTANT";

Vue.use(Vuex);

const state = {
  activatedRelationIndex: -1,
  rawRelations: [],
  relations: [],
  attrInfo: [],
  suggestions: [],
  suggestedTable: undefined,
  dragSourceIsCell: false,
  associationRule: "union",
  alterSpecList: [],
  newSpec: null,
};

const mutations = {
  addRawRelation(state, relation) {
    // relation.name = `Relation ${state.relations.length + 1}`;
    state.rawRelations.push(relation);
  },

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
  },

  changeSuggestion(state, suggestions) {
    state.suggestions = suggestions;
  },

  changeSuggestedTable(state, suggestedTable) {
    state.suggestedTable = suggestedTable;
  },

  changeAssociationRule(state, newRule) {
    state.associationRule = newRule;
  },

  changeAlterSpecList(state, newList) {
    state.alterSpecList = newList;
  },
  
  changeNewSpec(state, newSpec) {
    state.newSpec = newSpec;
  }
};

const actions = {
  // async extractRelationFromRawData({ commit }, rawData) {
  //   const resp = await fetch(EXTRACT_URL, {
  //     method: "POST",
  //     headers: {
  //       "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  //     },
  //     body: `data=${rawData}`,
  //   });
  //   if (resp.ok) {
  //     const relation = await resp.json();
  //     commit("addRelation", relation);
  //   } else {
  //     throw new Error(resp.statusText);
  //   }
  // },
  storeRawRelation({ commit }, relation) {
    commit("addRawRelation", relation);
  },
  storeRelation({ commit }, relation) {
    commit("addRelation", relation);
  },
  storeAttrInfo({ commit }, attrInfo) {
    commit("addAttrInfo", attrInfo);
  },
  setDragSource({ commit }, isCell) {
    commit("mutateDragSource", isCell);
  },
  storeSuggestion({ commit }, suggestions) {
    commit("changeSuggestion", suggestions);
  },
  storeSuggestedTable({ commit }, suggestedTable) {
    commit("changeSuggestedTable", suggestedTable);
  },
  storeAssociationRule({ commit }, newRule) {
    commit("changeAssociationRule", newRule);
  },
  storeAlterSpecList({ commit }, newList) {
    commit("changeAlterSpecList", newList);
  },
  storeNewSpec({ commit }, newSpec) {
    commit("changeNewSpec", newSpec);
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
