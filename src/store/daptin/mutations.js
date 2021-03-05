import Vue from "vue";

var jwtDecode = require('jwt-decode');
import SwaggerParser from "@apidevtools/swagger-parser";
import YAML from "js-yaml";

export function setToken(state, token) {
  state.token = token;
  state.decodedAuthToken = jwtDecode(token);


}

export function updateAppConnectionStatus(state, newStatus) {
  console.log("set app connection status", newStatus)
  state.appConnectionStatus = newStatus;
}

export function setTableRow(state, tableRow) {
  state.tableMap[tableRow.table_name] = tableRow
}

export function setEndpoint(state, endpoint) {
  state.endpoint = endpoint
}

export function setSelectedActionForEditor(state, action) {
  state.selectedActionForEditor = action
}

export function setActions(state, actions) {
  state.actions = [];
  for (var i = 0; i < actions.length; i++) {
    actions[i].ActionSchema = JSON.parse(actions[i].action_schema)
    state.actions.push(actions[i])
  }
}

export function setIntegrations(state, integrations) {
  state.integrations = integrations;
}

export function setCurrent(state, currentInfo) {
  var keys = Object.keys(currentInfo);
  for (const key of keys) {
    state.current[key] = currentInfo[key]
  }
}

export function setDecodedAuthToken(state, token) {
  state.decodedAuthToken = token;
}

export function setDefaultCloudStore(state, cloudStore) {
  state.defaultCloudStore = cloudStore;
}

export function setSelectedTable(state, tableName) {
  console.log("set selected table", tableName);
  state.selectedTable = tableName;
}

export function clearTablesCache(state) {

}

export function setTables(state, tables) {
  // var newTableMap = {}
  console.log("set tables", tables)
  //
  if (tables instanceof Object) {
    tables = Object.values(tables)
  }
  state.tables = [];
  for (var i = 0; i < tables.length; i++) {
    state.tables[tables[i].table_name] = tables[i];
  }
  console.log("Tables set to ", state.tables)
}

export function setTable(state, table) {
  console.log("set table", table)
  Vue.set(state.tables, table.table_name, table)
  console.log("Table set to ", state.tables)
}
