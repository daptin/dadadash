<template>
  <q-card flat>
    <q-card-section>
      <q-input label="Base name" v-model="newBaseName"></q-input>
    </q-card-section>
    <q-card-section>
      <div class="row">
        <div class="col-3 q-pa-md" v-for="item in catalog" @click="selectedItem = item">
          <q-card style="cursor: pointer; background: white" :class="{'selected-card': selectedItem ==  item}">
            <q-card-section style="text-align: center">
              <q-icon color="primary" :name="item.icon" style="width: 100px; height: 100px; font-size: 60px"></q-icon>
            </q-card-section>
            <q-card-section style="text-align: center">
              <span class="text-bold text-primary">{{ item.label }}</span>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn @click="$emit('add-base', newBaseName, selectedItem)" style="min-width: 100px" color="primary"
             :disable="!newBaseName || !selectedItem" label="Add"></q-btn>
    </q-card-actions>

  </q-card>
</template>

<script>
export default {
  name: "AddBaseView",
  data() {
    return {
      selectedItem: null,
      newBaseName: null,
      catalog: [
        {
          label: "Project tracker",
          icon: "fas fa-wrench",
          schema: {
            icon: "fas fa-wrench",
            label: "Project tracker",
            items: [
              {
                item_type: "table",
                label: "project",
                attributes: {
                  TableName: "project",
                  Columns: [{
                    ColumnName: "project_name",
                    ColumnType: "label",
                  }]
                }
              },
              {
                item_type: "table",
                label: "bug",
                attributes: {
                  TableName: "bug",
                  Columns: [{
                    ColumnName: "bug_title",
                    ColumnType: "label",
                  }, {
                    ColumnName: "status",
                    ColumnType: "label",
                  }]
                }
              },
              {
                item_type: "view",
                label: "Bugs",
                attributes: {
                  TableName: "bug",
                  Columns: [{
                    ColumnName: "bug_title",
                    ColumnType: "label",
                  }, {
                    ColumnName: "status",
                    ColumnType: "label",
                  }, {
                    ColumnName: "created_at",
                    ColumnType: "datetime",
                  }]
                }
              },
              {
                item_type: "summary",
                label: "Bug tracker",
                target: {
                  name: "bug"
                },
                title: {
                  icon: "fas fa-bug",
                  label: "Bug tracker",
                  color: "green",
                },
                attributes: {

                  source: {
                    type: "aggregate",
                    attributes: {
                      tableName: "bug",
                      group: "date(updated_at)",
                      column: "count(*)",
                      filter: ["eq(status, fixed)"]
                    }
                  }
                }
              }
            ]
          }
        },
        {
          label: "Log ML Experiments",
          icon: "fas fa-train"
        },
        {
          label: "Bug tracker",
          icon: "fas fa-bug"
        },
        {
          label: "Feedback collection",
          icon: "fas fa-comment-dots"
        },
      ]
    }
  },
  methods: {}
}
</script>

<style scoped>
.selected-card {
  background: #d5e3f1 !important;
}
</style>
