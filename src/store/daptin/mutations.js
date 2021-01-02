import Vue from "vue";

var jwtDecode = require('jwt-decode');

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
  console.log("set tables", tables)
  for (var tableName in tables) {
    Vue.set(state.tables, tableName, tables[tableName])
  }
  console.log("Tables set to ", state.tables)
}

export function setTable(state, table) {
  console.log("set table", table)
  Vue.set(state.tables, table.table_name, table)
  console.log("Table set to ", state.tables)
}
