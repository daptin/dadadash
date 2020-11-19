<template>
  <q-card style="background: transparent" flat>
    <q-card-section>
      <span class="text-bold">Create a base</span>
    </q-card-section>
    <q-card-section>
      <div class="row">
        <div class="col-6">
          <q-input label="Base name" v-model="newBaseName"></q-input>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <q-scroll-area horizontal class="q-pa-md q-gutter-sm" style="height: 250px; width: 100%">
        <div class="row no-wrap">
          <div v-for="item in catalog" class="q-pa-md">
            <q-card @click="selectedItem = item"
                    style="cursor: pointer; background: white; width: 250px; height: 200px; float: left"
                    :class="{'selected-card': selectedItem ===  item}">
              <q-card-section style="text-align: center">
                <q-icon color="primary" :name="item.icon" style="width: 100px; height: 100px; font-size: 60px"></q-icon>
              </q-card-section>
              <q-card-section style="text-align: center">
                <span class="text-bold text-primary">{{ item.label }}</span>
              </q-card-section>
            </q-card>
          </div>

        </div>
      </q-scroll-area>

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
          label: "From scratch",
          icon: "fas fa-chalkboard",
          schema: {
            icon: "fas fa-chalkboard",
            label: "A new base",
            items: [],
          }
        },
        {
          label: "Project tracker",
          icon: "fas fa-wrench",
          schema: {
            icon: "fas fa-wrench",
            label: "Project tracker",
            items: [
              {
                type: "table",
                label: "project",
                attributes: {
                  TableName: "project",
                  Columns: [
                    {
                      ColumnName: "project_name",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "project_start_date",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "project_end_date",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "project_cost",
                      ColumnType: "measurement",
                    },
                    {
                      ColumnName: "project_rating",
                      ColumnType: "rating",
                    },
                    {
                      ColumnName: "project_logo",
                      ColumnType: "file.png|jpg",
                      IsNullable: true,
                      DataType: "blob",
                    },
                  ]
                }
              },
              {
                type: "table",
                label: "bug",
                attributes: {
                  TableName: "bug",
                  Columns: [
                    {
                      ColumnName: "bug_title",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "status",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "blocker_count",
                      ColumnType: "measurement",
                    },
                    {
                      ColumnName: "eta_resolve",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "bug_description",
                      ColumnType: "content",
                      DataType: "text",
                    },
                    {
                      ColumnName: "confirmed",
                      ColumnType: "truefalse",
                      DataType: "int(1)",
                    },
                    {
                      ColumnName: "locked",
                      ColumnType: "truefalse",
                      DataType: "int(1)",
                    }
                  ]
                }
              },
              {
                type: "summary",
                label: "Project tracker",
                target: {
                  name: "bug"
                },
                title: {
                  icon: "fas fa-wrench",
                  label: "Project tracker",
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
              },
              {
                type: "document",
                label: "Legal note for end user"
              },
              {
                type: "spreadsheet",
                label: "Tax Projections By Merchant"
              },
              {
                type: "calendar",
                label: "Holiday Calender 2020"
              },
            ],
          }
        },
        {
          label: "Log ML Experiments",
          icon: "fas fa-train",
          schema: {
            icon: "fas fa-train",
            label: "ML Experiment tracker",
            items: [
              {
                type: "table",
                label: "project",
                attributes: {
                  TableName: "project",
                  Columns: [
                    {
                      ColumnName: "project_name",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "project_start_date",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "project_end_date",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "project_cost",
                      ColumnType: "measurement",
                    },
                    {
                      ColumnName: "project_rating",
                      ColumnType: "rating",
                    },
                    {
                      ColumnName: "project_logo",
                      ColumnType: "file.png|jpg",
                      IsNullable: true,
                      DataType: "blob",
                    },
                  ]
                }
              },
              {
                type: "table",
                label: "bug",
                attributes: {
                  TableName: "bug",
                  Columns: [
                    {
                      ColumnName: "bug_title",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "status",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "blocker_count",
                      ColumnType: "measurement",
                    },
                    {
                      ColumnName: "eta_resolve",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "bug_description",
                      ColumnType: "content",
                      DataType: "text",
                    },
                    {
                      ColumnName: "confirmed",
                      ColumnType: "truefalse",
                      DataType: "int(1)",
                    },
                    {
                      ColumnName: "locked",
                      ColumnType: "truefalse",
                      DataType: "int(1)",
                    }
                  ]
                }
              },
              {
                type: "summary",
                label: "ML Experiment tracker",
                target: {
                  name: "bug"
                },
                title: {
                  icon: "fas fa-train",
                  label: "ML Experiment tracker",
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
              },
              {
                type: "document",
                label: "Legal note for end user"
              },
              {
                type: "spreadsheet",
                label: "Tax Projections By Merchant"
              },
              {
                type: "calendar",
                label: "Holiday Calender 2020"
              },
            ],
          }
        },
        {
          label: "Bug tracker",
          icon: "fas fa-bug",
          schema: {
            icon: "fas fa-bug",
            label: "Bug tracker",
            items: [
              {
                type: "table",
                label: "project",
                attributes: {
                  TableName: "project",
                  Columns: [
                    {
                      ColumnName: "project_name",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "project_start_date",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "project_end_date",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "project_cost",
                      ColumnType: "measurement",
                    },
                    {
                      ColumnName: "project_rating",
                      ColumnType: "rating",
                    },
                    {
                      ColumnName: "project_logo",
                      ColumnType: "file.png|jpg",
                      IsNullable: true,
                      DataType: "blob",
                    },
                  ]
                }
              },
              {
                type: "table",
                label: "bug",
                attributes: {
                  TableName: "bug",
                  Columns: [
                    {
                      ColumnName: "bug_title",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "status",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "blocker_count",
                      ColumnType: "measurement",
                    },
                    {
                      ColumnName: "eta_resolve",
                      ColumnType: "datetime",
                    },
                    {
                      ColumnName: "bug_description",
                      ColumnType: "content",
                      DataType: "text",
                    },
                    {
                      ColumnName: "confirmed",
                      ColumnType: "truefalse",
                      DataType: "int(1)",
                    },
                    {
                      ColumnName: "locked",
                      ColumnType: "truefalse",
                      DataType: "int(1)",
                    }
                  ]
                }
              },
              {
                type: "summary",
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
              },
              {
                type: "document",
                label: "Legal note for end user"
              },
              {
                type: "spreadsheet",
                label: "Tax Projections By Merchant"
              },
              {
                type: "calendar",
                label: "Holiday Calender 2020"
              },
            ],
          }
        },
        {
          label: "Feedback collection",
          icon: "fas fa-comment-dots",
          schema: {
            icon: "fas fa-wrench",
            label: "Feedback collection",
            items: [
              {
                type: "table",
                label: "feedback",
                attributes: {
                  TableName: "feedback",
                  Columns: [
                    {
                      ColumnName: "feedback_body",
                      ColumnType: "label",
                    },
                    {
                      ColumnName: "feedback_rating",
                      ColumnType: "rating",
                    },
                    {
                      ColumnName: "feedback_score",
                      ColumnType: "measurement",
                    },
                  ]
                }
              },

              {
                type: "summary",
                label: "Feedback collection",
                target: {
                  name: "bug"
                },
                title: {
                  icon: "fas fa-comment-dots",
                  label: "Feedback collection",
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
              },
              {
                type: "document",
                label: "Legal note for end user"
              },
              {
                type: "spreadsheet",
                label: "Tax Projections By Merchant"
              },
              {
                type: "calendar",
                label: "Holiday Calender 2020"
              },
            ],
          }
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
