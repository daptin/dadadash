<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container>

    <q-page>



      <div class="row">
        <div class="col-4">
          <q-input dense v-model="nameFilter" icon="search" label="search">
            <template v-slot:prepend>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>
      </div>
      <div class="row" style="border-top: 1px solid black; border-bottom: 1px solid black">
        <div class="col-1">
          <q-btn-group flat size="sm">
            <q-btn icon="add" flat @click="showCreateAction()"/>
            <q-btn icon="delete" disable flat @click="$router.push('/tables/create')"/>
          </q-btn-group>
        </div>
      </div>

      <div class="row">
        <div class="col-8 col-xs-12 col-xl-6">

          <q-markup-table flat>
            <thead>
            <tr class="text-left">
              <th>Actions</th>
              <th></th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="action in filteredActions">
              <td style="width: 100px">{{ action.action_name }}</td>
              <td>{{ action.label }}</td>

              <td class="text-right">
                <q-btn flat class="float-right" icon="edit" size="md" @click="showEditAction(action)"></q-btn>
              </td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>

      </div>


      <q-drawer v-model="showCreateActionDrawer" :width="400" overlay side="right">
        <q-scroll-area class="fit row">
          <q-card>
            <q-card-section>
              <span class="text-h6">Create action</span>
            </q-card-section>
            <q-card-section>
              <q-form class="q-gutter-md">
                <textarea id="actionSchemaEditor"></textarea>
              </q-form>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn @click="showCreateActionDrawer = false">Cancel</q-btn>
              <q-btn class="float-right" color="primary" @click="createAction()">Create</q-btn>

            </q-card-actions>

          </q-card>
        </q-scroll-area>
      </q-drawer>


      <q-drawer v-model="showEditActionDrawer" :width="400" content-class="bg-grey-3" overlay side="right">
        <q-scroll-area class="fit row">
          <div class="q-pa-md">
            <span class="text-h6">Edit action</span>
            <q-form class="q-gutter-md">
              <q-btn color="negative" @click="deleteAction()">Delete</q-btn>
              <q-btn class="float-right" @click="showEditActionDrawer = false">Cancel</q-btn>
            </q-form>
          </div>
        </q-scroll-area>
      </q-drawer>
    </q-page>


  </q-page-container>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import "simplemde/dist/simplemde.min.css";
import SimpleMDE from 'simplemde';

const yaml = require('js-yaml');

export default {
  name: 'ActionPage',
  methods: {
    showCreateAction() {
      const that = this;
      that.showCreateActionDrawer = true;
      //  actionSchemaEditor
      setTimeout(function () {
        if (that.actionSchemaEditor && that.actionSchemaEditor.toTextArea) {
          that.actionSchemaEditor.toTextArea();
        }

        that.actionSchemaEditor = new SimpleMDE({
          element: document.getElementById("actionSchemaEditor"),
          toolbar: [],
        });

        that.actionSchemaEditor.value(`---
Name: my_new_action
Label: New Action Button Label
OnType: user_account
InstanceOptional: false
InFields:
OutFields:`)

      }, 400)
    },
    showEditAction(action) {
      console.log("Edit action", action)
      // this.selectedAction = action;
      // this.showEditActionDrawer = true
      // this.newAction.name = action.name;
      // this.newAction.root_path = action.root_path;
      this.setSelectedActionForEditor(action);
      this.$router.push('/integrations/action/' + action.ActionSchema.OnType + "/" + action.action_name)
    },
    deleteAction() {
      const that = this;
      console.log("Delete action", this.selectedAction);
      this.deleteRow({
        tableName: "action",
        reference_id: this.selectedAction.id
      }).then(function (res) {
        that.showEditActionDrawer = false;
        that.selectedAction = {};
        that.$q.notify({
          title: "Success",
          message: "Action deleted"
        });
        that.refresh()
      }).catch(function (res) {
        that.$q.notify({
          title: "Failed",
          message: JSON.stringify(res)
        })
      })
    },
    editAction() {
      const that = this;
      console.log("edit action", this.selectedAction);
      this.newAction.tableName = "action";
      this.newAction.id = this.selectedAction.id;
      this.updateRow(this.newAction).then(function (res) {
        that.showEditActionDrawer = false;
        that.selectedAction = {};
        that.$q.notify({
          title: "Success",
          message: "Action updated"
        });
        that.refresh()
      }).catch(function (res) {
        that.$q.notify({
          title: "Failed",
          message: JSON.stringify(res)
        })
      })
    },
    createAction() {
      const that = this;

      let actinSchema = that.actionSchemaEditor.value();
      console.log("new action", that.allTables, actinSchema);
      let spec = {}
      try {
        spec = yaml.load(actinSchema);
        console.log("Yaml spec", spec)
        if (!spec) {
          that.$q.notify({
            message: "Invalid spec, not valid YAML"
          });
          return
        }
      } catch (e) {
        that.$q.notify({
          message: "Invalid spec, not valid YAML"
        });
        return
      }

      this.newAction.action_name = spec.Name;
      var action_target_table = that.allTables.filter(function (e) {
        return e.table_name === spec.OnType
      })[0];
      console.log("target table", action_target_table)
      this.newAction.label = spec.Label;
      this.newAction.ActionSchema = JSON.stringify(spec);


      this.newAction.tableName = "action";
      this.newAction.world_id = {type: "world", "id": action_target_table.id};
      console.log("New action", this.newAction)
      that.createRow(that.newAction).then(function (res) {
        that.user = {};
        that.$q.notify({
          message: "action action created"
        });
        that.refresh();
        that.showCreateActionDrawer = false;
      }).catch(function (e) {
        if (e instanceof Array) {
          that.$q.notify({
            message: e[0].title
          })
        } else {
          that.$q.notify({
            message: "Failed to create action"
          })
        }
      });
    },
    ...mapActions(['loadData', 'getTableSchema', 'refreshTables',
      'createRow', 'deleteRow', 'refreshActions',
      'updateRow', 'executeAction', 'setSelectedActionForEditor']),
    refresh() {
      const that = this;
      that.refreshTables().then(function () {
        console.log("Loaded tabled")
        that.localTables = that.allTables.sort(function (a, b) {
          return a.table_name > b.table_name;
        });
      }).catch(function (err) {
        console.log("Failed to refresh tables", err)
      });
      this.refreshActions().then(function () {
        console.log("actions loaded")
      })


    }
  },
  data() {
    return {
      text: '',
      localTables: [],
      actionSchemaEditor: null,
      nameFilter: null,
      selectedAction: {},
      actionProviderOptions: [
        {
          icon: 'fas fa-aws',
          label: 'Amazon Drive',
          description: 'OAuth token based'
        },
        {
          icon: 'fas fa-aws',
          label: 'Amazon S3',
          description: 'OAuth token based'
        },
        {
          icon: 'fas fa-aws',
          label: 'Backblaze B2',
          description: 'OAuth token based'
        },
        {
          icon: 'fas fa-aws',
          label: 'Dropbox',
          description: 'OAuth token based'
        },
        {
          icon: 'fas fa-aws',
          label: 'FTP',
          description: 'OAuth token based'
        },
        {
          icon: 'fas fa-aws',
          label: 'Google Drive',
          description: 'OAuth token based'
        },
        {
          icon: 'fas fa-aws',
          label: 'local',
          description: 'The local filesystem'
        },
      ],
      showHelp: false,
      newAction: {
        action_name: null,
        label: null,
        action_schema: '',
        world_id: null,
        instance_optional: false,
      },
      showCreateActionDrawer: false,
      showEditActionDrawer: false,
      filter: null,
      localActions: [],
      columns: [
        {
          name: 'name',
          field: 'name',
          label: 'action name',
          align: 'left',
          sortable: true,
        }
      ],
      ...mapState([])
    }
  },
  mounted() {
    this.refresh();
  },
  computed: {
    filteredActions() {
      const that = this;
      return that.actions.filter(function (e) {
        return !that.nameFilter || (
          e.action_name.indexOf(that.nameFilter) > -1
        )
      })
    },
    ...mapGetters(['actions', 'allTables']),
    ...mapState([])
  },

  watch: {}
}
</script>
