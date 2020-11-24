import {DaptinClient} from 'daptin-client';

// const daptinClient = new DaptinClient(window.location.protocol + "//" + window.location.hostname, false, function () {
let endpoint = window.location.hostname === "site.daptin.com" ? "http://localhost:6336" : window.location.protocol + "//" + window.location.hostname + (window.location.port === "80" ? "" : ':' + window.location.port);
// let process = process || undefined;
// if (process) {
//   endpoint = "http://localhost:6336"
// }


console.log("Daptin endpoint is:", endpoint)
var daptinClient = new DaptinClient(endpoint, false, {
  getToken: function () {
    return localStorage.getItem("token");
  }
});

daptinClient.worldManager.init();

export function loadTables({commit}) {
  console.log("Load tables");
  daptinClient.worldManager.loadModels(false).then(function (worlds) {
    console.log("All models loaded", arguments);
    commit('setTables', worlds)
  }).catch(function (e) {
    console.log("Failed to connect to backend", e);
  })
}

export function setToken({commit}) {
  let token = localStorage.getItem("token");
  if (!token) {
    throw "Failed to login";
  }
  commit('setToken', token)
}

export function setDecodedAuthToken({commit}, token) {
  commit('setDecodedAuthToken', token)
}

export function setSelectedTable({commit}, tableName) {
  commit("setSelectedTable", tableName)
}

export function getDefaultCloudStore({commit}) {
  console.log("Find default cloud store");
  daptinClient.jsonApi.findAll("cloud_store", {
    query: JSON.stringify([{
      "column": "name",
      "operator": "is",
      "value": "localstore"
    }])
  }).then(function (res) {
    console.log("Found cloud store", res);
    const cloudStore = res.data[0];
    commit("setDefaultCloudStore", cloudStore)
  }).catch(function (err) {
    console.log("Failed to find default cloud store", err)
  })
}

export function executeAction({commit}, params) {
  var tableName = params.tableName;
  var actionName = params.actionName;
  return daptinClient.actionManager.doAction(tableName, actionName, params.params);
}

export function deleteTableByName({commit}, tableName) {
  return new Promise(function (resolve, reject) {
    console.log("Delete table by name", tableName);
    daptinClient.jsonApi.findAll("world", {
      query: JSON.stringify([{
        column: "table_name",
        operator: "is",
        value: tableName
      }]),
      page: {
        size: 1,
      },
      fields: "reference_id"
    }).then(function (res) {
      console.log("Table reference id for deletion ", res.data);

      daptinClient.actionManager.doAction("world", "remove_table", {
        world_id: res.data[0].reference_id
      }).then(function (res) {
        console.log("Table deletion response", res);
        resolve(tableName);
      }).catch(function (err) {
        console.log("Failed to load table id for deletion", err)
        reject(tableName)
      })


    }).catch(function (err) {
      console.log("Failed to load table id for deletion", err)
      reject(tableName)
    })
  })

}

export function deleteRow({commit}, row) {
  return daptinClient.jsonApi.destroy(row.tableName, row.reference_id)
}

export function createRow({commit}, row) {
  var tableName = row.tableName;
  delete row.tableName;
  return daptinClient.jsonApi.create(tableName, row)
}

export function updateRow({commit}, row) {
  var tableName = row.tableName;
  delete row.tableName;
  return daptinClient.jsonApi.update(tableName, row)
}

export function removeRelation({commit}, row) {
  return daptinClient.jsonApi.one(row.tableName, row.id).relationships(row.relationName).destroy([{
    type: row.relationName,
    id: row.relationId
  }])
}

export function addRelation({commit}, row) {
  return daptinClient.jsonApi.one(row.tableName, row.id).relationships(row.relationName).patch({
    type: row.relationName,
    id: row.relationId
  })
}

export function addManyRelation({commit}, row) {
  return daptinClient.jsonApi.one(row.tableName, row.id).relationships(row.relationName).patch([{
    type: row.relationName,
    id: row.relationId
  }])
}

export function loadData({commit}, params) {
  var tableName = params.tableName;
  params = params.params;
  return daptinClient.jsonApi.findAll(tableName, params);
}

export function loadOneData({commit}, params) {
  var tableName = params.tableName;
  return daptinClient.jsonApi.find(tableName, params.referenceId);
}

export function loadDataRelations({commit}, params) {
  var primaryTable = params.tableName;
  var relationName = params.relation;
  var primaryTableId = params.reference_id;
  return daptinClient.jsonApi.one(primaryTable, primaryTableId).all(relationName).get()
}

export function loadAggregates({commit}, params) {
  var primaryTable = params.tableName;
  return daptinClient.statsManager.getStats(primaryTable, params)
}


export function loadServerConfig({commit}) {
  return daptinClient.configManager.getAllConfig()
}

export function saveConfig({commit}, params) {
  return daptinClient.configManager.setConfig(params.name, "backend", params.value)
}

export function getTableSchema({commit}, tableName) {
  return new Promise(function (resolve, reject) {
    daptinClient.worldManager.loadModel(tableName, false).then(function () {
      resolve(daptinClient.worldManager.getColumnKeys(tableName, true));
    }).catch(reject)
  })
}

export function loadModel({commit}, tableName) {
  return daptinClient.worldManager.loadModel(tableName, true);
}

export function refreshTableSchema({commit}, tableName) {
  daptinClient.worldManager.loadModels(true).then(function (worlds) {
    console.log("All models loaded", arguments);
    commit('setTables', worlds)
  }).catch(function (e) {
    console.log("Failed to connect to backend", e);
  });
  return daptinClient.worldManager.refreshWorld(tableName, true);
}

export function setWorkspaceByName({commit}, workspaceName) {
  daptinClient.jsonApi.findAll("")
}

export function loadWorkspaces({commit}, workspaceName) {

  return new Promise(function (resolve, reject) {
    let queryPayload = {
      tableName: "document",
      params: {
        query: [{
          column: "document_path",
          operator: "is",
          value: "/"
        }, {
          column: "mime_type",
          operator: "like",
          value: "workspace/root"
        }],
        page: {
          size: 100,
        },
      }
    };
    if (workspaceName && workspaceName.length > 0) {
      queryPayload.params.query = [
        {
          column: "document_name",
          operator: "contains",
          value: workspaceName
        }
      ]
      queryPayload.params.page.size = 1;
    }
    queryPayload.params.query = JSON.stringify(queryPayload.params.query)

    daptinClient.jsonApi.findAll("document", queryPayload).then(function (res) {
      console.log("Workspaces loaded", res);
    });

  });


}


export function setCurrent({commit}, currentData) {
  commit("setCurrent", currentData)
}
