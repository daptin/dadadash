import Vue from "vue";

var jwtDecode = require('jwt-decode');

export function setToken(state, token) {
  state.token = token;
  var decodedAuthToken = jwtDecode(token);
  state.decodedAuthToken = decodedAuthToken;


}

export function setTableRow(state, tableRow) {
  state.tableMap[tableRow.table_name] = tableRow
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
  state.tables = {}
  for (var tableName in tables) {
    Vue.set(state.tables, tableName, tables[tableName])
  }
  console.log("Tables set to ", state.tables)
}

export function setTable(state, table) {
  Vue.set(state.tables, table.table_name, table)
  console.log("Tables set to ", state.tables)
}
