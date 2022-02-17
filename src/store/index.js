import Vue from "vue";
import Vuex from "vuex";

import Utils from "@/utils.js";
import { EXTRACT_URL } from "@/CONSTANT";
import { W } from "r-collapse-vue";

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
  partialSpecSuggestion: null,
  row_header: [],
  column_header: [],
  body: []
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
  },

  changePartialSpecSuggestion(state, newSuggestion) {
    state.partialSpecSuggestion = newSuggestion;
  },

  changeRowHeader(state, row_header) {
    state.row_header = row_header;
  },

  changeColumnHeader(state, column_header) {
    state.column_header = column_header;
  },

  changeBody(state, body) {
    state.body = body;
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
  },
  storePartialSpecSuggestion({ commit }, newSuggestion) {
    commit("changePartialSpecSuggestion", newSuggestion);
  },
  // setRowHeader({ commit }, row_header) {
  //   commit("changeRowHeader", row_header);
  // },
  // setColumnHeader({ commit }, column_header) {
  //   commit("changeColumnHeader", column_header);
  // },
  // setBody({ commit }, body) {
  //   commit("changeBody", body);
  // }
  setSpec({ commit }, spec) {
    commit("changeRowHeader", spec.row_header);
    commit("changeColumnHeader", spec.column_header);
    commit("changeBody", spec.body);
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
