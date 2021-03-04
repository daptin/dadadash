<template>
  <q-page-container style="height: calc(100vh - 100px)">
    <q-page>
      <div class="row">
        <div class="col-3 q-pa-md">
          <div class="q-mb-md">
            <q-input debounce="300" label="filter actions" v-model="actionNameFilter"></q-input>
          </div>
          <div class="row">
            <div class="col-12">
              <q-scroll-area style="height: calc(100vh - 100px)">
                <q-list>
                  <q-expansion-item header-class="bg-blue-3" label="Data actions">
                    <div
                      v-for="(block, index) in dataActionBlocks.filter(e => !actionNameFilter || e.preview.title.toLowerCase().indexOf(actionNameFilter)  > -1)"
                      :key="'data-action-' + index"
                      class="q-mr-md col-12 q-pa-sm"
                    >
                      <data-action-block
                        @add="addNode('data', block)"
                        :title="block.preview.title"
                        :description="block.preview"
                      />
                    </div>
                  </q-expansion-item>


                  <q-expansion-item header-class="bg-blue-3" label="Internal actions">
                    <div
                      v-for="(block, index) in internalActionBlocks.filter(e => !actionNameFilter || e.preview.title.toLowerCase().indexOf(actionNameFilter)  > -1)"
                      :key="'internal-' + index"
                      class="q-mr-md col-12 q-pa-sm"
                    >
                      <data-action-block
                        @add="addNode('internal', block)"
                        :title="block.preview.title"
                        :description="block.preview"
                      />
                    </div>
                  </q-expansion-item>


                  <q-expansion-item header-class="bg-blue-3" :key="'integration-' + index"
                                    v-for="(integration, index) in integrations()"
                                    :label="integration.name">
                    <div style="max-height: 50vh; overflow-y: auto; word-break: break-all"
                    >
                      <div v-for="(operation, q) in Object.values(integration.ParsedApi.paths)"
                           :key="'openapi-' + integration.name + '-' + q"

                      >
                        <div
                          v-for="(op, p) in Object.values(operation).filter(e => !actionNameFilter || (e.operationId && e.operationId.toLowerCase().indexOf(actionNameFilter)  > -1))"
                          class="q-mr-md col-12 q-pa-sm">
                          <data-action-block
                            @add="addNode('openapi', op, integration)"
                            :title="op.operationId"
                            :description="op.description"
                          />
                        </div>
                      </div>
                    </div>

                  </q-expansion-item>


                </q-list>
              </q-scroll-area>

            </div>

          </div>
        </div>

        <div class="col-8">

          <div class="row">
            <div v-if="nodes.length > 0" class="col-6 q-pa-md">
              <div class="text-bold">{{ nodes[0].data.Type }}</div>
              <div class="text-subtitle2">{{ nodes[0].data.Method }}</div>
            </div>
            <div class="col-2 q-pa-md">
              <q-checkbox v-model="action.instance_optional" label="instance optional"></q-checkbox>
            </div>
            <div class="col-4 q-pa-md">
              <q-btn-group>
                <q-btn class="float-right" @click="deleteAction()" color="negative" label="Delete this action"></q-btn>
                <q-btn class="float-right" @click="saveAction()" color="green" label="Save"></q-btn>
                <q-btn class="float-right" @click="execute()" color="primary" label="Execute"></q-btn>
              </q-btn-group>
            </div>
          </div>

          <div v-if="nodes.length > 0" class="row" style="height: calc(100vh - 100px); overflow-y: scroll; padding-bottom: 50px">


            <div class="col-12 q-pa-md">

              <q-card>
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col">
                    </div>
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="row">


                    <div class="col-6 " style="max-height: 400px; overflow-x: scroll">
                      <div class="row">
                        <span class="text-bold">Attributes</span>
                      </div>

                      <div class="row q-pa-md" v-if="!action.instance_optional">
                        <div class="col-11 ">
                          <q-input stack-label autogrow clearable name="reference_id" label="reference_id"
                                   v-model="nodes[0].data.Attributes['reference_id']"/>
                        </div>
                        <div class="col-1">

                        </div>
                      </div>

                      <div class="row q-pa-md" v-for="attribute in Object.keys(nodes[0].data.Attributes)">
                        <div class="col-11 ">
                          <q-input stack-label autogrow clearable :name="attribute" :label="attribute"
                                   v-model="nodes[0].data.Attributes[attribute]"/>
                        </div>
                        <div class="col-1">
                          <q-btn @click="deleteAttribute(nodes[0], attribute)" icon="fas fa-trash" color="negative"
                                 size="xs" flat></q-btn>
                        </div>
                      </div>


                      <div class="row q-pa-md">
                        <q-btn size="sm" color="green" @click="showNewInputFieldNameDialog = true"
                               label="Add new input field"></q-btn>
                      </div>
                    </div>

                    <div class="col-6">
                      <q-card flat dark>
                        <q-card-section class="q-pa-md">
                          <q-input dark value="~" disable label="Reference"></q-input>
                        </q-card-section>
                      </q-card>
                    </div>


                  </div>


                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 q-pa-md" v-for="(node, i) in nodes" v-if="i > 0">

              <q-card>
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="text-h6">{{ node.data.Type }}</div>
                      <div class="text-subtitle2">{{ node.data.Method }} - #{{ i }}</div>
                    </div>

                    <div class="col-auto">
                      <q-btn color="grey-7" round flat icon="more_vert">
                        <q-menu cover auto-close>
                          <q-list>
                            <q-item clickable @click="nodes.splice(i, 1)">
                              <q-item-section>Remove</q-item-section>
                            </q-item>
                            <q-item clickable @click="swapItem(i, i-1)">
                              <q-item-section>Move up</q-item-section>
                            </q-item>
                            <q-item v-if="i < nodes.length - 1 " clickable @click="swapItem(i, i+1)">
                              <q-item-section>Move down</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                      <q-btn color="grey-7" @click="nodes.splice(i, 1)" round flat icon="fas fa-trash">
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="row">


                    <div class="col-6 " style="max-height: 400px; overflow-x: scroll" v-if="node.data.Attributes">
                      <div class="row">
                        <span class="text-bold">Attributes</span>
                      </div>

                      <div class="row q-pa-md" v-for="attribute in Object.keys(node.data.Attributes)">
                        <div class="col-11 ">
                          <q-input stack-label autogrow clearable :name="attribute" :label="attribute"
                                   v-model="node.data.Attributes[attribute]"/>
                        </div>

                      </div>

                    </div>

                    <div class="col-6">
                      <q-card flat dark>
                        <q-card-section class="q-pa-md">
                          <q-input dark v-model="node.data.Condition" label="Condition"></q-input>
                          <q-input dark v-model="node.data.Reference" label="Reference"></q-input>
                          <q-checkbox size="xs" dark v-model="node.data.SkipInResponse"
                                      label="Skip outcome result in response body"></q-checkbox>
                          <q-checkbox size="xs" dark v-model="node.data.ContinueOnError"
                                      label="Continue executing other outcomes on error"></q-checkbox>
                        </q-card-section>
                      </q-card>
                    </div>


                  </div>


                </q-card-section>
              </q-card>
            </div>


          </div>

        </div>
      </div>
      <q-dialog v-model="showNewInputFieldNameDialog">
        <q-card>
          <q-card-section>
            <span class="text-h6">Name for new input field</span> <br/>
          </q-card-section>
          <q-card-section>
            <q-form @submit="addNewInputField()">
              <q-input autofocus label="Name" v-model="newInputFieldName"></q-input>
            </q-form>
            <span class="text-subtitle">a-z A-Z 0-9 - _</span>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Add" color="primary" @click="addNewInputField()"></q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="newDataBlockConfigurationDialog">
        <q-card style="min-width: 30%">
          <q-card-section>
            <span class="text-bold">Table data action</span>
            <q-checkbox label="Show only user created tables" v-model="filterUserTables"></q-checkbox>
          </q-card-section>
          <q-card-section>
            <q-select v-model="newDataBlockForTable"
                      :options="tables().filter(function (e){if (!filterUserTables){return true} return e.IsHiddenTable}).sort(function (a, b){return a.TableName > b.TableName})"
                      option-label="table_name"></q-select>
          </q-card-section>
          <q-card-section
            v-if="!!newDataBlockForTable && (newNodeData.preview.title === 'create' || newNodeData.preview.title === 'update')">
            <div class="row" v-for="column in JSON.parse(newDataBlockForTable.world_schema_json).Columns">
              <div class="col-12 q-pa-xs">
                {{ column.ColumnName }}
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <!--            <q-btn label="Cancel"-->
            <!--                   @click="(newDataBlockConfigurationDialog = false), (newDataBlockForTable = null) "></q-btn>-->
            <q-btn label="Add" color="primary" @click="addNode(null, null, newDataBlockForTable)"></q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>


  </q-page-container>

</template>
<style>
.flowy-drag-handle button {
  cursor: grab;
}

.flowy-block.draggable-mirror {
  opacity: 0.6;
}
</style>
<script>
import "@hipsjs/flowy-vue/dist/lib/flowy-vue.css";
import {v4 as uuidv4} from "uuid";
import Vue from 'vue'
import {mapActions, mapGetters} from "vuex";
import DataActionNode from "pages/Components/DataActionNode";
import DataActionBlock from "pages/Components/DataActionBlock";

export default {
  name: "FlowBuilder",
  components: {DataActionBlock, DataActionNode},
  methods: {
    execute() {
      const that = this;

      console.log("Execute action", this.action, this.nodes[0].data.Attributes);

      that.executeAction({
        tableName: this.action.ActionSchema.OnType,
        actionName: this.action.action_name,
        params: this.nodes[0].data.Attributes,
      }).then(function (res) {
        that.$q.notify({
          message: "Action executed: " + JSON.stringify(res),
          type: "success"
        });
      }).catch(function (err) {
        console.log("Failed to execute action", err)
        that.$q.notify({
          message: "Failed to execute action: " + JSON.stringify(err)
        })
      })

    },
    deleteAction() {
      const that = this;
      this.deleteRow({
        tableName: 'action',
        reference_id: this.action.reference_id,
      }).then(function (res) {
        that.$q.notify({
          message: "Action deleted",
          type: "success"
        });
        that.$router.push('/integrations/actions')
      }).catch(function (err) {
        console.log("Failed to delete action", err)
        that.$q.notify({
          message: "Failed to delete action: " + JSON.stringify(err),
          type: "negative"
        });

      })
    },
    saveAction() {

      const that = this;
      var actionSchema = {...this.action.ActionSchema}
      actionSchema.InFields = Object.keys(this.nodes[0].data.Attributes).map(function (e) {
        return {
          Name: e,
          ColumnName: e,
          ColumnType: "label"
        }
      });
      // this.nodes.unshift();
      actionSchema.OutFields = [];
      for (var i = 1; i < this.nodes.length; i++) {
        actionSchema.OutFields.push(this.nodes[i].data)
      }
      actionSchema.InstanceOptional = this.action.instance_optional;

      this.action.ActionSchema = JSON.stringify(actionSchema)
      this.action.tableName = "action";
      console.log("save action", this.action, this.nodes);
      this.action.permission = this.action.permission & 4096;
      this.updateRow(this.action).then(function (res) {
        console.log("Action saved", res);
        var updatedAction = res.data;
        updatedAction.ActionSchema = JSON.parse(updatedAction.ActionSchema)
        that.setSelectedActionForEditor(updatedAction);
        that.parseAction();
        that.$q.notify({
          message: "Action saved, creating endpoint for action",
          type: "success"
        });

        that.executeAction({
          tableName: "world",
          actionName: "restart_daptin"
        }).then(function () {
          that.$q.notify({
            message: "Action ready to be executed",
            type: "success"
          });
        }).catch(function (err) {
          console.log("configuration resync failed", err)
          that.$q.notify({
            message: "Reconfiguration failed, changes will not take effect until next config re-sync"
          })
        })


      }).catch(function (err) {
        console.log("Failed to save action", err)
        that.$q.notify({
          message: "Failed to save action: " + JSON.stringify(err),
          type: "error"
        });
      });
    },
    addNewInputField() {
      console.log("New input field", this.newInputFieldName)
      if (!this.newInputFieldName) {
        this.$q.notify({
          type: "error",
          message: "Please enter a name"
        });
        return;
      }
      if (this.newInputFieldName.match(/[^a-zA-Z0-9\-_]/)) {
        this.$q.notify({
          type: "error",
          message: "Name can have only these characters: a-z A-Z 0-9 - _"
        });
        return;

      }


      // this.nodes[0].Attributes[this.newInputFieldName] = "";
      Vue.set(this.nodes[0].data.Attributes, this.newInputFieldName, "")
      this.newInputFieldName = "";

      this.showNewInputFieldNameDialog = false;
    },
    deleteAttribute(node, attribute) {
      console.log("Delete attribute", node.data.Attributes, attribute)
      Vue.delete(node.data.Attributes, attribute);
    },
    ...mapActions(['refreshIntegrations', 'updateRow', 'deleteRow', 'executeAction', 'setSelectedActionForEditor']),
    swapItem(i, j) {
      const temp = this.nodes[j];
      this.nodes[j] = this.nodes[i];
      this.nodes[i] = temp;
      this.$forceUpdate();
    },
    addNode(nodeType, block, newDataBlockForTable) {
      const that = this;
      console.log("add node stored", this.newNodeType, this.newNodeData, newDataBlockForTable)
      console.log("add node passed", nodeType, block)
      if (nodeType) {
        this.newNodeType = nodeType;
        this.newNodeData = block;
      }
      switch (this.newNodeType) {
        case "data":
          if (!newDataBlockForTable) {
            this.newDataBlockConfigurationDialog = true;
            return
          }
          this.newDataBlockConfigurationDialog = false;
          if (!this.newNodeData.node.Attributes) {
            this.newNodeData.node.Attributes = {}
          }

          switch (this.newNodeData.preview.title) {
            case "create":
            case "update":
              var tableSchema = JSON.parse(newDataBlockForTable.world_schema_json);
              for (const i in tableSchema.Columns) {
                const column = tableSchema.Columns[i];
                this.newNodeData.node.Attributes[column.ColumnName] = "";
              }
              break;

            case "get by query":
              this.newNodeData.node.Attributes["query"] = "";
              break;
            case "get by id":
              this.newNodeData.node.Attributes["reference_id"] = "";
              break;
            case "delete":
              this.newNodeData.node.Attributes["reference_id"] = "";
              break;
          }
          break;
        case "internal":
          break;
        case "openapi":
          this.newNodeData.node = {
            Type: newDataBlockForTable.name,
            Method: this.newNodeData.operationId,
            Attributes: this.newNodeData.parameters ? this.newNodeData.parameters.map(e => e.name) : {},
          }
          if (this.newNodeData.requestBody.content) {
            var bodyContent = Object.values(this.newNodeData.requestBody.content)[0]
            console.log("request body content", bodyContent);
            var properties = Object.keys(bodyContent.schema.properties);
            properties.map(function (e){
              that.newNodeData.node.Attributes[e] = ""
            })
          }
          break;
      }

      const id = uuidv4();
      var node = {}
      node.data = {...this.newNodeData.node};
      node.data.Attributes = {...this.newNodeData.node.Attributes}
      node.id = id;
      node.parentId = this.nodes[this.nodes.length - 1].id
      console.log("Add new node", this.nodes, node)
      this.nodes.push(node);
    },
    remove(event) {
      console.log('remove', event)

      // node we're dragging to
      const {node} = event

      // we use lodash in this demo to remove node from the array
      let nodeIndex = -1;
      for (let i = 0; i < this.nodes.length; i++) {
        let node1 = this.nodes[i];
        if (node1.id === node.id) {
          nodeIndex = i;
          break;
        }
      }
      if (nodeIndex !== -1) {
        this.nodes.splice(nodeIndex, 1);
      }
    },
    move(event) {
      console.log('move', event);

      // node we're dragging to and node we've just dragged
      const {dragged, to} = event;

      // change panentId to id of node we're dragging to
      dragged.parentId = to.id;
    },
    add(event) {
      // every node needs an ID
      const id = uuidv4();

      // add to array of nodes
      this.nodes.push({
        id,
        ...event.node,
      });
    },
    onDragStart(event) {
      console.log('onDragStart', event);
      this.dragging = true;
    },
    parseAction() {

      let action = JSON.parse(JSON.stringify(this.selectedActionForEditor()));
      this.action = action;
      console.log("parse action", action)
      let actionSchema = action.ActionSchema;
      var outFields = actionSchema.OutFields || [];
      let parentId = uuidv4();
      var inputAttributes = {};
      if (actionSchema.InFields) {
        for (const inField of actionSchema.InFields) {
          inputAttributes[inField.ColumnName] = "";
        }
      } else {
        actionSchema.InFields = []
      }
      this.nodes = [];
      this.nodes.push({
        id: parentId,
        parentId: -1,
        removable: false,
        data: {
          "Type": actionSchema.Label,
          "Method": actionSchema.OnType,
          "Reference": "",
          "SkipInResponse": true,
          "Attributes": inputAttributes
        },
      })
      for (const outField of outFields) {
        console.log("out field", outField);
        this.nodes.push({
          id: uuidv4(),
          parentId: this.nodes[this.nodes.length - 1].id,
          data: outField,
        })
      }


    },
  },
  data: () => ({
    filterUserTables: false,
    newInputFieldNameDialog: false,
    newNodeData: null,
    newNodeType: null,
    action: {},
    showNewInputFieldNameDialog: false,
    newInputFieldName: null,
    newDataBlockForTable: null,
    newDataBlockConfigurationDialog: false,
    actionNameFilter: null,
    holder: [],
    ...mapGetters(['selectedActionForEditor', 'integrations', 'tables']),
    dragging: false,
    dataActionBlocks: [
      {
        "preview": {
          "title": "create"
        },
        "node": {
          "Type": "",
          "Method": "POST",
        }
      },
      {
        "preview": {
          "title": "get by query"
        },
        "node": {
          "Type": "",
          "Method": "GET",
          "Attributes": {
            "query": "",
            "include_relation": "",
            "page[size]": "",
            "page[number]": "",
          }
        }
      },
      {
        "preview": {
          "title": "get by id"
        },
        "node": {
          "Type": "",
          "Method": "GET",
        }
      },
      {
        "preview": {
          "title": "update"
        },
        "node": {
          "Type": "",
          "Method": "PUT",
        }
      },
      {
        "preview": {
          "title": "delete"
        },
        "node": {
          "Type": "",
          "Method": "DELETE",
          "Attributes": {}
        }
      },
    ],
    openApiIntegrationActions: [],
    internalActionBlocks: [
      {
        "preview": {"title": "cloud_store.files.import"},
        "node": {"Method": "EXECUTE", "Type": "cloud_store.files.import", "Attributes": {"table_name": "$.table_name"}}
      }, {
        "preview": {"title": "integration.install"},
        "node": {"Method": "EXECUTE", "Type": "integration.install", "Attributes": {"reference_id": "$.reference_id"}}
      }, {
        "preview": {"title": "client.file.download"},
        "node": {
          "Method": "ACTIONRESPONSE",
          "Type": "client.file.download",
          "Attributes": {
            "content": "!btoa(subject.certificate_pem)",
            "contentType": "application/x-x509-ca-cert",
            "message": "!'Certificate for ' + subject.hostname",
            "name": "!subject.hostname + '.pem.crt'"
          }
        }
      }, {
        "preview": {"title": "acme.tls.generate"},
        "node": {
          "Method": "EXECUTE",
          "Type": "acme.tls.generate",
          "Attributes": {"certificate": "~subject", "email": "~email"}
        }
      }, {
        "preview": {"title": "self.tls.generate"},
        "node": {"Method": "EXECUTE", "Type": "self.tls.generate", "Attributes": {"certificate": "~subject"}}
      }, {
        "preview": {"title": "otp.generate"},
        "node": {
          "Method": "EXECUTE",
          "Type": "otp.generate",
          "Attributes": {"email": "$.email", "mobile": "~mobile_number"}
        }
      }, {
        "preview": {"title": "otp.login.verify"},
        "node": {
          "Method": "EXECUTE",
          "Type": "otp.login.verify",
          "Attributes": {"mobile": "~mobile_number", "otp": "~otp"}
        }
      }, {
        "preview": {"title": "otp.generate"},
        "node": {
          "Method": "EXECUTE",
          "Type": "otp.generate",
          "Attributes": {"email": "~email", "mobile": "~mobile_number"}
        }
      }, {
        "preview": {"title": "otp.login.verify"},
        "node": {
          "Method": "EXECUTE",
          "Type": "otp.login.verify",
          "Attributes": {"mobile": "~mobile_number", "otp": "~otp"}
        }
      }, {
        "preview": {"title": "world.column.delete"},
        "node": {
          "Method": "EXECUTE",
          "Type": "world.column.delete",
          "Attributes": {"column_name": "~column_name", "world_id": "$.reference_id"}
        }
      }, {
        "preview": {"title": "world.delete"},
        "node": {"Method": "EXECUTE", "Type": "world.delete", "Attributes": {"world_id": "$.reference_id"}}
      }, {
        "preview": {"title": "world.column.rename"},
        "node": {
          "Method": "EXECUTE",
          "Type": "world.column.rename",
          "Attributes": {
            "column_name": "~column_name",
            "new_column_name": "~new_column_name",
            "world_id": "$.reference_id"
          }
        }
      }, {
        "preview": {"title": "site.storage.sync"},
        "node": {
          "Method": "EXECUTE",
          "Type": "site.storage.sync",
          "Attributes": {"cloud_store_id": "$.cloud_store_id", "path": "~path", "site_id": "$.reference_id"}
        }
      }, {
        "preview": {"title": "column.storage.sync"},
        "node": {
          "Method": "EXECUTE",
          "Type": "column.storage.sync",
          "Attributes": {"column_name": "~column_name", "table_name": "~table_name"}
        }
      }, {
        "preview": {"title": "mail.servers.sync"},
        "node": {"Method": "EXECUTE", "Type": "mail.servers.sync", "Attributes": {}}
      }, {
        "preview": {"title": "system_json_schema_update"},
        "node": {
          "Method": "EXECUTE",
          "Type": "system_json_schema_update",
          "Attributes": {"json_schema": "!JSON.parse('[{\"name\":\"empty.json\",\"file\":\"data:application/json;base64,e30K\",\"type\":\"application/json\"}]')"}
        }
      }, {
        "preview": {"title": "generate.random.data"},
        "node": {
          "Method": "EXECUTE",
          "Type": "generate.random.data",
          "Attributes": {
            "count": "~count",
            "table_name": "~table_name",
            "user_account_id": "$user.id",
            "user_reference_id": "$user.reference_id"
          }
        }
      }, {
        "preview": {"title": "__data_export"},
        "node": {
          "Method": "EXECUTE",
          "Type": "__data_export",
          "Attributes": {"table_name": "$.table_name", "world_reference_id": "$.reference_id"}
        }
      }, {
        "preview": {"title": "__csv_data_export"},
        "node": {
          "Method": "EXECUTE",
          "Type": "__csv_data_export",
          "Attributes": {"table_name": "$.table_name", "world_reference_id": "$.reference_id"}
        }
      }, {
        "preview": {"title": "__data_import"},
        "node": {
          "Method": "EXECUTE",
          "Type": "__data_import",
          "Attributes": {
            "dump_file": "~dump_file",
            "table_name": "$.table_name",
            "truncate_before_insert": "~truncate_before_insert",
            "user": "~user",
            "world_reference_id": "$.reference_id"
          }
        }
      }, {
        "preview": {"title": "cloudstore.file.upload"},
        "node": {
          "Method": "EXECUTE",
          "Type": "cloudstore.file.upload",
          "Attributes": {
            "file": "~file",
            "oauth_token_id": "$.oauth_token_id",
            "path": "~path",
            "root_path": "$.root_path",
            "store_provider": "$.store_provider"
          }
        }
      }, {
        "preview": {"title": "cloudstore.site.create"},
        "node": {
          "Method": "EXECUTE",
          "Type": "cloudstore.site.create",
          "Attributes": {
            "cloud_store_id": "$.reference_id",
            "hostname": "~hostname",
            "oauth_token_id": "$.oauth_token_id",
            "path": "~path",
            "root_path": "$.root_path",
            "site_type": "~site_type",
            "store_provider": "$.store_provider",
            "user_account_id": "$user.reference_id"
          }
        }
      }, {
        "preview": {"title": "cloudstore.file.delete"},
        "node": {
          "Method": "EXECUTE",
          "Type": "cloudstore.file.delete",
          "Attributes": {
            "oauth_token_id": "$.oauth_token_id",
            "path": "~path",
            "root_path": "$.root_path",
            "store_provider": "$.store_provider"
          }
        }
      }, {
        "preview": {"title": "cloudstore.folder.create"},
        "node": {
          "Method": "EXECUTE",
          "Type": "cloudstore.folder.create",
          "Attributes": {
            "name": "~name",
            "oauth_token_id": "$.oauth_token_id",
            "path": "~path",
            "root_path": "$.root_path",
            "store_provider": "$.store_provider"
          }
        }
      }, {
        "preview": {"title": "cloudstore.path.move"},
        "node": {
          "Method": "EXECUTE",
          "Type": "cloudstore.path.move",
          "Attributes": {
            "destination": "~destination",
            "oauth_token_id": "$.oauth_token_id",
            "root_path": "$.root_path",
            "source": "~source",
            "store_provider": "$.store_provider"
          }
        }
      }, {
        "preview": {"title": "site.file.list"},
        "node": {
          "Method": "EXECUTE",
          "Type": "site.file.list",
          "Attributes": {"path": "~path", "site_id": "$.reference_id"}
        }
      }, {
        "preview": {"title": "site.file.get"},
        "node": {
          "Method": "EXECUTE",
          "Type": "site.file.get",
          "Attributes": {"path": "~path", "site_id": "$.reference_id"}
        }
      }, {
        "preview": {"title": "site.file.delete"},
        "node": {
          "Method": "EXECUTE",
          "Type": "site.file.delete",
          "Attributes": {"path": "~path", "site_id": "$.reference_id"}
        }
      }, {
        "preview": {"title": "system_json_schema_update"},
        "node": {
          "Method": "EXECUTE",
          "Type": "system_json_schema_update",
          "Attributes": {"json_schema": "~schema_file"}
        }
      }, {
        "preview": {"title": "__upload_xlsx_file_to_entity"},
        "node": {
          "Method": "EXECUTE",
          "Type": "__upload_xlsx_file_to_entity",
          "Attributes": {
            "add_missing_columns": "~add_missing_columns",
            "create_if_not_exists": "~create_if_not_exists",
            "data_xls_file": "~data_xls_file",
            "entity_name": "~entity_name"
          }
        }
      }, {
        "preview": {"title": "__upload_csv_file_to_entity"},
        "node": {
          "Method": "EXECUTE",
          "Type": "__upload_csv_file_to_entity",
          "Attributes": {
            "add_missing_columns": "~add_missing_columns",
            "create_if_not_exists": "~create_if_not_exists",
            "data_csv_file": "~data_csv_file",
            "entity_name": "~entity_name"
          }
        }
      }, {
        "preview": {"title": "__download_cms_config"},
        "node": {"Method": "EXECUTE", "Type": "__download_cms_config", "Attributes": {}}
      }, {
        "preview": {"title": "__become_admin"},
        "node": {
          "Method": "EXECUTE",
          "Type": "__become_admin",
          "Attributes": {"user": "~user", "user_account_id": "$user.id"}
        }
      }, {
        "preview": {"title": "otp.generate"},
        "node": {"Method": "EXECUTE", "Type": "otp.generate", "Attributes": {"email": "~email", "mobile": "~mobile"}}
      }, {
        "preview": {"title": "client.notify"},
        "node": {
          "Method": "ACTIONRESPONSE",
          "Type": "client.notify",
          "Attributes": {"message": "Sign-up successful. Redirecting to sign in", "title": "Success", "type": "success"}
        }
      }, {
        "preview": {"title": "client.redirect"},
        "node": {
          "Method": "ACTIONRESPONSE",
          "Type": "client.redirect",
          "Attributes": {"delay": 2000, "location": "/auth/signin", "window": "self"}
        }
      }, {
        "preview": {"title": "otp.generate"},
        "node": {"Method": "EXECUTE", "Type": "otp.generate", "Attributes": {"email": "$email"}}
      }, {
        "preview": {"title": "mail.send"},
        "node": {
          "Method": "EXECUTE",
          "Type": "mail.send",
          "Attributes": {
            "body": "Your verification code is: $otp.otp",
            "from": "no-reply@localhost",
            "subject": "Request for password reset",
            "to": "~email"
          }
        }
      }, {
        "preview": {"title": "otp.login.verify"},
        "node": {"Method": "EXECUTE", "Type": "otp.login.verify", "Attributes": {"email": "~email", "otp": "~otp"}}
      }, {
        "preview": {"title": "random.generate"},
        "node": {"Method": "EXECUTE", "Type": "random.generate", "Attributes": {"type": "password"}}
      }, {
        "preview": {"title": "user_account"},
        "node": {
          "Method": "EXECUTE",
          "Type": "user_account",
          "Attributes": {"password": "!newPassword.value", "reference_id": "$user[0].reference_id"}
        }
      }, {
        "preview": {"title": "mail.send"},
        "node": {
          "Method": "EXECUTE",
          "Type": "mail.send",
          "Attributes": {
            "body": "Your new password is: $newPassword.value",
            "from": "no-reply@localhost",
            "subject": "Request for password reset",
            "to": "~email"
          }
        }
      }, {
        "preview": {"title": "jwt.token"},
        "node": {"Method": "EXECUTE", "Type": "jwt.token", "Attributes": {"email": "~email", "password": "~password"}}
      }, {
        "preview": {"title": "oauth.client.redirect"},
        "node": {
          "Method": "EXECUTE",
          "Type": "oauth.client.redirect",
          "Attributes": {"authenticator": "$.name", "scope": "$.scope"}
        }
      }, {
        "preview": {"title": "oauth.login.response"},
        "node": {
          "Method": "EXECUTE",
          "Type": "oauth.login.response",
          "Attributes": {
            "authenticator": "~authenticator",
            "code": "~code",
            "state": "~state",
            "user_account_id": "~user.id",
            "user_reference_id": "~user.reference_id"
          }
        }
      }, {
        "preview": {"title": "oauth.profile.exchange"},
        "node": {
          "Method": "EXECUTE",
          "Type": "oauth.profile.exchange",
          "Attributes": {
            "authenticator": "~authenticator",
            "profileUrl": "$connection[0].profile_url",
            "token": "$auth.access_token",
            "tokenInfoUrl": "$connection[0].token_url"
          }
        }
      }, {
        "preview": {"title": "jwt.token"},
        "node": {
          "Method": "EXECUTE",
          "Type": "jwt.token",
          "Attributes": {"email": "!profile.email || profile.emailAddress", "skipPasswordCheck": true}
        }
      }
    ],
    nodes: []
  }),
  mounted() {
    let selectedAction = this.selectedActionForEditor();
    if (!selectedAction) {
      this.$router.push('/integrations/actions')
      return
    }
    console.log("action editor for ", this.$route.params, selectedAction);

    const that = this;
    let integrations = this.integrations();

    this.parseAction();
    if (integrations.length === 0) {
      this.refreshIntegrations().then(function (res) {
        console.log("Integrations loaded", that.integrations())
      }).catch(function (err) {
        console.log("Failed to load integrations", err);
        that.$q.notify({
          message: "Failed to load OpenAPI Integrations",
          type: "error"
        })
      })
    }


  }
}
</script>

<style scoped>

</style>
