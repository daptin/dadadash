<template>
  <q-page-container style="height: calc(100vh - 100px)">
    <q-page>
      <div class="row">
        <div class="col-3 q-pa-md">
          <div class="q-mb-md">Drag blocks to the node tree below using the drag handle</div>
          <div class="row">
            <div class="col-12">
              <q-scroll-area style="height: calc(100vh - 100px)">
                <q-list>
                  <q-expansion-item label="Data actions">
                    <div
                      v-for="(block, index) in dataActionBlocks"
                      :key="index"
                      class="q-mr-md col-12 q-pa-sm"
                    >
                      <data-action-block
                        @add="addNode({
                          data: block.node,
                        })"
                        :title="block.preview.title"
                        :description="block.preview"
                      />
                    </div>
                  </q-expansion-item>


                  <q-expansion-item label="Internal actions">
                    <div
                      v-for="(block, index) in internalActionBlocks"
                      :key="index"
                      class="q-mr-md col-12 q-pa-sm"
                    >
                      <data-action-block
                        :title="block.preview.title"
                        :description="block.preview"
                      />
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
                      <q-btn color="grey-7" round flat icon="more_vert">
                        <q-menu cover auto-close>
                          <q-list>
                            <q-item clickable @click="nodes.splice(i, 1)">
                              <q-item-section>Remove</q-item-section>
                            </q-item>
                            <q-item clickable @click="swapItem(i, i-1)">
                              <q-item-section>Move up</q-item-section>
                            </q-item>
                            <q-item clickable @click="swapItem(i, i+1)">
                              <q-item-section>Move down</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                      <q-btn color="grey-7" @click="nodes.splice(i, 1)" round flat icon="fas fa-times">
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
                <q-card-section v-if="node.data.Attributes instanceof Array">
                  <div class="row">
                    <div class="col-6 q-pa-md"></div>
                    <div class="col-6 q-pa-md">
                      <div class="row" v-for="attribute in node.data.Attributes">
                        <div class="col-11 ">
                          <q-input :name="attribute.Name" :label="attribute.Name"/>
                        </div>
                        <div class="col-1">
                          <q-btn icon="fas fa-times" color="negative" size="xs" flat></q-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>

                <q-card-section
                  v-if="!(node.data.Attributes instanceof Array) && node.data.Attributes instanceof Object">
                  <div class="row">

                    <div class="col-6 q-pa-md"></div>
                    <div class="col-6 q-pa-md">
                      <div class="row">
                        <div class="col-12 q-pa-md" v-for="attribute in Object.keys(node.data.Attributes)">
                          <q-input :name="attribute" :label="attribute" v-model="node.data.Attributes[attribute]"/>
                        </div>
                      </div>
                    </div>


                  </div>


                </q-card-section>
              </q-card>
            </div>
          </div>

        </div>
      </div>
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
import {mapGetters} from "vuex";
import DataActionNode from "pages/Components/DataActionNode";
import DataActionBlock from "pages/Components/DataActionBlock";


export default {
  name: "FlowBuilder",
  components: {DataActionBlock, DataActionNode},
  methods: {
    swapItem(i, j) {

      if (i > j) {
        const t = i;
        i = j;
        j = t;
      }
      this.nodes.splice(i, 0, this.nodes.splice(j, 1, this.nodes[i]))
    },
    onDragStartNewBlock(event) {
      console.log('onDragStartNewBlock', event);
      // contains all the props and attributes passed to data-action-block
      const {props} = event
      this.newDraggingBlock = props;
    },
    onDragStopNewBlock(event) {
      console.log('onDragStopNewBlock', event);
      this.newDraggingBlock = null;
    },
    // REQUIRED
    beforeMove({to, from}) {
      // called before moving node (during drag and after drag)
      // indicator will turn red when we return false
      // from is null when we're not dragging from the current node tree
      console.log('beforeMove', to, from);

      // we cannot drag upper parent nodes in this demo
      if (from && from.parentId === -1) {
        return false;
      }
      // we're adding a new node (not moving an existing one)
      if (from === null) {
        // we've passed this attribute to the data-action-block
        if (this.newDraggingBlock['custom-attribute'] === false) {
          return false
        }
      }

      return true;
    },
    // REQUIRED
    beforeAdd({to, from}) {
      // called before moving node (during drag and after drag)
      // indicator will turn red when we return false
      // from is null when we're not dragging from the current node tree
      console.log('beforeAdd', to, from);

      // we've passed this attribute to the data-action-block
      if (this.newDraggingBlock['custom-attribute'] === false) {
        return false
      }

      return true;
    },
    randomInteger() {
      return Math.floor(Math.random() * 10000) + 1;
    },
    addNode(node) {
      const id = uuidv4();
      node.id = id
      node.parentId = this.nodes[this.nodes.length - 1].id
      this.nodes.push({
        ...node,
      });
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
      let action = this.selectedActionForEditor();
      let actionSchema = action.action_schema;
      console.log("Action Schema", JSON.stringify(actionSchema, null, 4));
      var outFields = actionSchema.OutFields;
      let parentId = uuidv4();
      var inputAttributes = {};
      for (const inField of actionSchema.InFields) {
        inputAttributes[inField.Name] = "";
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
    holder: [],
    ...mapGetters(['selectedActionForEditor']),
    dragging: false,
    dataActionBlocks: [
      {
        "preview": {
          "title": "create"
        },
        "node": {
          "title": "create",
          "description": "create"
        }
      },
      {
        "preview": {
          "title": "get"
        },
        "node": {
          "title": "get",
          "description": "get"
        }
      },
      {
        "preview": {
          "title": "update"
        },
        "node": {
          "title": "update",
          "description": "update"
        }
      },
      {
        "preview": {
          "title": "delete"
        },
        "node": {
          "title": "delete",
          "description": "delete"
        }
      },
    ],
    internalActionBlocks: [{
      "preview": {"title": "cloud_store.files.import"},
      "node": {"Method": "EXECUTE", "Type": "cloud_store.files.import", "Attributes": {}}
    }, {
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
    this.parseAction()
  }
}
</script>

<style scoped>

</style>
