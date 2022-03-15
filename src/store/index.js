import Vue from "vue";
import Vuex from "vuex";

import Utils from "@/utils.js";
import { EXTRACT_URL } from "@/CONSTANT";
import { P, W } from "r-collapse-vue";

Vue.use(Vuex);

const state = {
  activatedRelationIndex: -1,
  rawRelations: [],
  relations: [],
  attrInfo: [],
  suggestions: [],
  currentTable: undefined,
  dragSourceIsCell: false,
  associationRule: "union",
  alterSpecList: [],
  newSpec: null,
  partialSpecSuggestion: null,
  deleteSpecSuggestion: null,
  row_header: [],
  column_header: [],
  body: [],
  currentActiveGrid: {},
  rowInfo: {},
  colInfo: {},
  canSuggest: true,
  previewTable: undefined,
  reapplyPartialSpec: undefined,
};

let currentState = {};

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

  changeCurrentTable(state, currentTable) {
    state.currentTable = currentTable;
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

  changeDeleteSpecSuggestion(state, newSuggestion) {
    state.deleteSpecSuggestion = newSuggestion;
  },

  changeRowHeader(state, row_header) {
    // console.log(state.row_header, row_header);
    state.row_header = row_header;
  },

  changeColumnHeader(state, column_header) {
    state.column_header = column_header;
  },

  changeBody(state, body) {
    state.body = body;
  },

  changeCurrentActiveGrid(state, currentActiveGrid) {
    state.currentActiveGrid = currentActiveGrid;
  },

  changeRowInfo(state, rowInfo) {
    state.rowInfo = rowInfo;
  },

  changeColInfo(state, colInfo) {
    state.colInfo = colInfo;
  },

  changeCurrentState(state) {
    // currentState = Object.assign({}, state);
    // currentState.row_header = Object.assign({}, state.row_header);
    currentState = Utils.deepClone(state);
    currentState.currentTable = Utils.deepClone(state.currentTable);
    console.log(currentState.currentTable);
  },

  restoreState(state) {
    state.activatedRelationIndex = currentState.activatedRelationIndex;
    state.rawRelations = currentState.rawRelations;
    state.relations = currentState.relations;
    state.attrInfo = currentState.attrInfo;
    state.suggestions = currentState.suggestions;
    state.currentTable = currentState.currentTable;
    state.dragSourceIsCell = currentState.dragSourceIsCell;
    state.associationRule = currentState.associationRule;
    state.alterSpecList = currentState.alterSpecList;
    state.newSpec = currentState.newSpec;
    // state.partialSpecSuggestion = currentState.partialSpecSuggestion;
    state.deleteSpecSuggestion = currentState.deleteSpecSuggestion;
    state.row_header = currentState.row_header;
    state.column_header = currentState.column_header;
    state.body = currentState.body;
    state.currentActiveGrid = currentState.currentActiveGrid;
    state.rowInfo = currentState.rowInfo;
    state.colInfo = currentState.colInfo;
    state.canSuggest = currentState.canSuggest;
    // console.log(currentState.row_header);
    // console.log(state.row_header);;
  },

  changeCanSuggest(state, canSuggest) {
    state.canSuggest = canSuggest;
  },

  changePreviewTable(state, previewTable) {
    state.previewTable = previewTable;
  },

  changeReapplyPartialSpec(state, reapplyPartialSpec) {
    state.reapplyPartialSpec = reapplyPartialSpec;
  },
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
  storeCurrentTable({ commit }, currentTable) {
    commit("changeCurrentTable", currentTable);
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
  storeDeleteSpecSuggestion({ commit }, newSuggestion) {
    commit("changeDeleteSpecSuggestion", newSuggestion);
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
  },
  storeCurrentActiveGrid({ commit }, currentActiveGrid) {
    commit("changeCurrentActiveGrid", currentActiveGrid);
  },
  storeRowInfo({ commit }, rowInfo) {
    commit("changeRowInfo", rowInfo);
  },
  storeColInfo({ commit }, colInfo) {
    commit("changeColInfo", colInfo);
  },
  storeCurrentState({ commit }) {
    commit("changeCurrentState");
  },
  restoreCurrentState({ commit }) {
    commit("restoreState");
  },
  storeCanSuggest({ commit }, canSuggest) {
    commit("changeCanSuggest", canSuggest);
  },
  storePreviewTable({ commit }, previewTable) {
    commit("changePreviewTable", previewTable);
  },
  storeReapplyPartialSpec({ commit }, reapplyPartialSpec) {
    commit("changeReapplyPartialSpec", reapplyPartialSpec);
  },
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
