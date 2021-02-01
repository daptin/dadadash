<template>
  <q-page-container style="height: calc(100vh - 100px)">
    <q-page>
      <div class="row">
        <div class="col-3 q-pa-md">
          <div class="q-mb-md">
            <q-input label="filter actions" v-model="actionNameFilter"></q-input>
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

        <div
          class="col-6 q-pa-md"
        >
          <div class="row" style="height: calc(100vh - 100px); overflow-y: scroll">
            <div class="col-12 q-pa-md" v-for="(node, i) in nodes">
              <q-card>
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="text-h6">{{ node.data.Type }}</div>
                      <div class="text-subtitle2">{{ node.data.Method }} - #{{ i }}</div>
                    </div>

                    <div class="col-auto">
                      <q-btn color="grey-7" v-if="i > 0" round flat icon="more_vert">
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
                      <q-btn color="grey-7" v-if="i > 0" @click="nodes.splice(i, 1)" round flat icon="fas fa-times">
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
                <q-card-section>
                  <div class="row">

                    <div class="col-6 q-pa-md">
                      <q-card flat>
                        <q-card-section>
                          <q-input v-model="node.data.Condition" label="Condition"></q-input>
                          <q-input v-model="node.data.Reference" label="Reference"></q-input>
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-6 " v-if="node.data.Attributes">
                      <div class="row q-pa-md" v-for="attribute in Object.keys(node.data.Attributes)">
                        <div class="col-11 ">
                          <q-input :name="attribute" :label="attribute" v-model="node.data.Attributes[attribute]"/>
                        </div>
                        <div class="col-1">
                          <q-btn @click="deleteAttribute(node, attribute)" icon="fas fa-times" color="negative"
                                 size="xs" flat></q-btn>
                        </div>
                      </div>
                      <div class="row q-pa-md" v-if="i === 0">
                        <q-btn size="md" color="green" @click="showNewInputFieldNameDialog = true"
                               label="Add new input field"></q-btn>
                      </div>
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
            <span class="text-h6">Name for new input field</span>
          </q-card-section>
          <q-card-section>
            <q-input label="Name" v-model="newInputFieldName"></q-input>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Add" color="primary" @click="addNewInputField()"></q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <!--      <q-dialog v-model="newDataBlockConfigurationDialog">-->
      <!--        <q-card style="min-width: 30%">-->
      <!--          <q-card-section>-->
      <!--            <span class="text-h6">Data action</span>-->
      <!--          </q-card-section>-->
      <!--          <q-card-section>-->
      <!--            <q-select v-model="newDataBlockForTable"-->
      <!--                      :options="tables()" option-label="table_name"></q-select>-->
      <!--          </q-card-section>-->
      <!--          <q-card-section v-if="!!newDataBlockForTable">-->
      <!--            <div class="row" v-for="column in JSON.parse(newDataBlockForTable.world_schema_json).Columns">-->
      <!--              <div class="col-12 q-pa-xs">-->
      <!--                {{ column.ColumnName }}-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </q-card-section>-->
      <!--          <q-card-actions align="right">-->
      <!--            &lt;!&ndash;            <q-btn label="Cancel"&ndash;&gt;-->
      <!--            &lt;!&ndash;                   @click="(newDataBlockConfigurationDialog = false), (newDataBlockForTable = null) "></q-btn>&ndash;&gt;-->
      <!--            <q-btn label="Add" color="primary" @click="addNode(null, null, newDataBlockForTable)"></q-btn>-->
      <!--          </q-card-actions>-->
      <!--        </q-card>-->
      <!--      </q-dialog>-->
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
    addNewInputField() {
      console.log("New input field", this.newInputFieldName)
      if (!this.newInputFieldName) {
        this.$q.notify({
          type: "error",
          message: "Please enter a name"
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
    ...mapActions(['refreshIntegrations']),
    swapItem(i, j) {
      const temp = this.nodes[j];
      this.nodes[j] = this.nodes[i];
      this.nodes[i] = temp;
      this.$forceUpdate();
    },
    addNode(nodeType, block) {

      console.log("add node", nodeType, block)
      this.newNodeType = nodeType;
      this.newNodeData = block;
      switch (nodeType) {
        case "data":
          // this.newDataBlockConfigurationDialog = true;
          // return
          break;
        case "internal":
          break;
        case "openapi":
          break;
      }

      const id = uuidv4();
      var node = {}
      node.data = {...block.node};
      node.data.Attributes = {}
      node.id = id
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
    async parseIntegrationActions() {
      let integrations = this.integrations();
      console.log("Integrations", integrations)
    },

    parseAction() {

      let action = this.selectedActionForEditor();
      let actionSchema = action.action_schema;
      var outFields = actionSchema.OutFields;
      let parentId = uuidv4();
      var inputAttributes = {};
      if (actionSchema.InFields) {
        for (const inField of actionSchema.InFields) {
          inputAttributes[inField.ColumnName] = "";

        }
      }
      this.nodes.push({
        id: parentId,
        parentId: -1,
        removable: false,
        data: {
          "Type": actionSchema.Label,
          "Method": actionSchema.OnType,
          "Reference": "$",
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
    newInputFieldNameDialog: false,
    newNodeData: null,
    newNodeType: null,
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
          "Attributes": {

          }
        }
      },
    ],
    openApiIntegrationActions: [],
    internalActionBlocks: [
      {
        "preview": {"title": "cloud_store.files.import"},
        "node": {"Method": "EXECUTE", "Type": "cloud_store.files.import", "Attributes": {}}
      },
      {
        "preview": {"title": "integration.install"},
        "node": {"Method": "EXECUTE", "Type": "integration.install", "Attributes": {}}
      }, {
        "preview": {"title": "client.file.download"},
        "node": {"Method": "EXECUTE", "Type": "client.file.download", "Attributes": {}}
      }, {
        "preview": {"title": "acme.tls.generate"},
        "node": {"Method": "EXECUTE", "Type": "acme.tls.generate", "Attributes": {}}
      }, {
        "preview": {"title": "self.tls.generate"},
        "node": {"Method": "EXECUTE", "Type": "self.tls.generate", "Attributes": {}}
      }, {
        "preview": {"title": "otp.generate"},
        "node": {"Method": "EXECUTE", "Type": "otp.generate", "Attributes": {}}
      }, {
        "preview": {"title": "otp.login.verify"},
        "node": {"Method": "EXECUTE", "Type": "otp.login.verify", "Attributes": {}}
      }, {
        "preview": {"title": "world.column.delete"},
        "node": {"Method": "EXECUTE", "Type": "world.column.delete", "Attributes": {}}
      }, {
        "preview": {"title": "world.delete"},
        "node": {"Method": "EXECUTE", "Type": "world.delete", "Attributes": {}}
      }, {
        "preview": {"title": "world.column.rename"},
        "node": {"Method": "EXECUTE", "Type": "world.column.rename", "Attributes": {}}
      }, {
        "preview": {"title": "site.storage.sync"},
        "node": {"Method": "EXECUTE", "Type": "site.storage.sync", "Attributes": {}}
      }, {
        "preview": {"title": "column.storage.sync"},
        "node": {"Method": "EXECUTE", "Type": "column.storage.sync", "Attributes": {}}
      }, {
        "preview": {"title": "mail.servers.sync"},
        "node": {"Method": "EXECUTE", "Type": "mail.servers.sync", "Attributes": {}}
      }, {
        "preview": {"title": "system_json_schema_update"},
        "node": {"Method": "EXECUTE", "Type": "system_json_schema_update", "Attributes": {}}
      }, {
        "preview": {"title": "client.redirect"},
        "node": {"Method": "EXECUTE", "Type": "client.redirect", "Attributes": {}}
      }, {
        "preview": {"title": "generate.random.data"},
        "node": {"Method": "EXECUTE", "Type": "generate.random.data", "Attributes": {}}
      }, {
        "preview": {"title": "__data_export"},
        "node": {"Method": "EXECUTE", "Type": "__data_export", "Attributes": {}}
      }, {
        "preview": {"title": "__csv_data_export"},
        "node": {"Method": "EXECUTE", "Type": "__csv_data_export", "Attributes": {}}
      }, {
        "preview": {"title": "__data_import"},
        "node": {"Method": "EXECUTE", "Type": "__data_import", "Attributes": {}}
      }, {
        "preview": {"title": "cloudstore.file.upload"},
        "node": {"Method": "EXECUTE", "Type": "cloudstore.file.upload", "Attributes": {}}
      }, {
        "preview": {"title": "cloudstore.site.create"},
        "node": {"Method": "EXECUTE", "Type": "cloudstore.site.create", "Attributes": {}}
      }, {
        "preview": {"title": "cloudstore.file.delete"},
        "node": {"Method": "EXECUTE", "Type": "cloudstore.file.delete", "Attributes": {}}
      }, {
        "preview": {"title": "cloudstore.folder.create"},
        "node": {"Method": "EXECUTE", "Type": "cloudstore.folder.create", "Attributes": {}}
      }, {
        "preview": {"title": "cloudstore.path.move"},
        "node": {"Method": "EXECUTE", "Type": "cloudstore.path.move", "Attributes": {}}
      }, {
        "preview": {"title": "site.file.list"},
        "node": {"Method": "EXECUTE", "Type": "site.file.list", "Attributes": {}}
      }, {
        "preview": {"title": "site.file.get"},
        "node": {"Method": "EXECUTE", "Type": "site.file.get", "Attributes": {}}
      }, {
        "preview": {"title": "site.file.delete"},
        "node": {"Method": "EXECUTE", "Type": "site.file.delete", "Attributes": {}}
      }, {
        "preview": {"title": "__upload_xlsx_file_to_entity"},
        "node": {"Method": "EXECUTE", "Type": "__upload_xlsx_file_to_entity", "Attributes": {}}
      }, {
        "preview": {"title": "__upload_csv_file_to_entity"},
        "node": {"Method": "EXECUTE", "Type": "__upload_csv_file_to_entity", "Attributes": {}}
      }, {
        "preview": {"title": "__download_cms_config"},
        "node": {"Method": "EXECUTE", "Type": "__download_cms_config", "Attributes": {}}
      }, {
        "preview": {"title": "__become_admin"},
        "node": {"Method": "EXECUTE", "Type": "__become_admin", "Attributes": {}}
      }, {
        "preview": {"title": "client.redirect"},
        "node": {"Method": "EXECUTE", "Type": "client.redirect", "Attributes": {}}
      }, {
        "preview": {"title": "jwt.token"},
        "node": {"Method": "EXECUTE", "Type": "jwt.token", "Attributes": {}}
      }, {
        "preview": {"title": "oauth.client.redirect"},
        "node": {"Method": "EXECUTE", "Type": "oauth.client.redirect", "Attributes": {}}
      }, {
        "preview": {"title": "oauth.login.response"},
        "node": {"Method": "EXECUTE", "Type": "oauth.login.response", "Attributes": {}}
      }, {
        "preview": {"title": "oauth.profile.exchange"},
        "node": {"Method": "EXECUTE", "Type": "oauth.profile.exchange", "Attributes": {}}
      }],
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
        console.log("Integrtions loaded")
      }).then(this.parseIntegrationActions)
        .catch(function (err) {
          console.log("Failed to load integrations", err);
          that.$q.notify({
            message: "Failed to load OpenAPI Integrations",
            type: "error"
          })
        })
    } else {
      this.parseIntegrationActions()
    }


  }
}
</script>

<style scoped>

</style>
