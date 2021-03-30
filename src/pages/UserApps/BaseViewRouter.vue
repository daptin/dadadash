<template>

  <q-tab-panels keep-alive v-model="baseItem.reference_id">
    <q-tab-panel :key="item.reference_id" style="padding: 0" :name="item.reference_id"
                 v-for="item in baseConfig.items">
      <component :is="baseItemComponentMap[item.document_extension]"
                 :baseItem="baseItemConfigMap[item.reference_id]"
                 v-if="!documentLoading && baseItemConfigMap[item.reference_id]"
                 @save-base-item-contents="saveBaseItemContents"
      ></component>
    </q-tab-panel>
  </q-tab-panels>

</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "BaseViewRouter",
  props: ["baseItem", "baseConfig"],
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: ('[' + this.baseConfig.name + '] ') + (this.baseItem ? this.baseItem.document_name : 'New file') + " - " + this.baseItem.document_extension
    }
  },
  methods: {
    reloadBaseItem() {
      const that = this;
      that.showComponent = false;


      that.tableMap = {}

      for (var i = 0; i < that.baseConfig.items.length; i++) {
        var item1 = that.baseConfig.items[i];
        if (item1.type === "table") {
          that.tableMap[item1.document_name] = item1.targetTable
        }
      }

      that.baseItemConfigMap = {}

      for (let i = 0; i < that.baseConfig.items.length; i++) {
        const item = that.baseConfig.items[i];

        let baseItemConfig = item;
        if (item.document_content) {
          try {
            // console.log("Read document contents", item.document_content[0].contents)
            // var extendConfig = JSON.parse(atob(item.document_content[0].contents))
            // baseItemConfig = {...item, ...extendConfig};
          } catch (e) {
            console.log("Failed to read contents of item", e, item)
            baseItemConfig = item;
          }
        }

        if (!baseItemConfig.targetTable) {
          if (baseItemConfig.attributes && baseItemConfig.attributes.TableName) {
            baseItemConfig.targetTable = that.tableMap[baseItemConfig.attributes.TableName]
          } else if (baseItemConfig.target && baseItemConfig.target.name) {
            baseItemConfig.targetTable = that.tableMap[baseItemConfig.target.name]
          }
        }
        that.baseItemConfigMap[item.reference_id] = baseItemConfig;
      }


      console.log("Base item config 2", that.baseItemConfigMap)
      that.$nextTick().then(function () {
        that.showComponent = true;
        // setTimeout(function (){
        //   document.getElementsByClassName("q-page-container")[1].scrollIntoView()
        // }, 2000)
      })
    },
    getJsonFromDocument: function (document) {

      let contents = document.contents;
      if (!contents) {
        return {}
      }
      if (contents.indexOf(",") > -1) {
        return JSON.parse(atob(contents.split(",")[1]))
      }
      return JSON.parse(atob(contents));
    },
    saveBaseItemContents(baseEncodedFileItem) {

      const that = this;
      console.log("Save contents for base", that.baseItem, baseEncodedFileItem.length);

      that.baseItemConfigMap[that.baseItem.reference_id].file = baseEncodedFileItem;
      try {

        var originalContent = this.getJsonFromDocument(that.baseItem.document_content[0])
      } catch (e) {
        that.$q.notify({
          type: "error",
          message: "This file seems to be corrupted, can only be deleted"
        });
        return
      }

      var contentKeys = Object.keys(originalContent);
      var baseKeys = Object.keys(that.baseItem);
      for (const baseKey of baseKeys) {
        if (contentKeys.indexOf(baseKey) > -1) {
          delete originalContent[contentKeys]
        }
      }
      originalContent.file = baseEncodedFileItem;

      that.baseItem.document_content[0].contents = "application/json," + btoa(JSON.stringify(originalContent));
      that.baseItem.tableName = "document";
      that.updateRow(that.baseItem).then(function (res) {
        console.log("base item content updated")
      }).catch(function (err) {
        console.log("Failed to save contents in base item", err);
        that.$q.notify({
          message: "Failed to save base item contents"
        })
      })
    },
    ...mapActions(['updateRow', 'loadOneData']),
    ensureBaseItemContents(base) {
      const that = this;
      that.documentLoading = true;
      if (!base.document_content[0].contents) {
        console.log("Contents missing ");
        that.loadOneData({
          referenceId: that.baseItem.reference_id,
          tableName: "document",
          params: {
            included_relations: "document_content"
          }
        }).then(function (res) {
          console.log("data contents loaded", res);
          var contents = JSON.parse(atob(res.data.document_content[0].contents));
          var extendedItem = {...base, ...contents}
          that.baseItemConfigMap[extendedItem.reference_id] = extendedItem;
          that.documentLoading = false;
        }).catch(function (err) {
          that.documentLoading = false;
        })

      }
    }
  },

  data() {
    return {
      showComponent: true,
      documentLoading: true,
      baseItemConfig: null,
      baseItemConfigMap: {},
      baseItemComponentMap: {
        'view': 'edit-data-table',
        'table': 'edit-data-table',
        'document': 'document-editor',
        'folder': 'file-browser',
        'spreadsheet': 'spreadsheet-editor',
        'mermaid_graph': 'mermaid-graph-editor',
        'calendar': 'calendar-view',
      },
      targetTable: null,
      tableMap: {},
    }
  },
  mounted() {
    console.log("Mounted base view router", this.baseItem, this.baseConfig);
    const that = this;
    that.ensureBaseItemContents(this.baseItem)
    that.reloadBaseItem();
    console.log("Base item config 1", that.baseItemConfig)

  },
  watch: {
    'baseItem': function (e) {
      console.log("base item changeD", this.baseItem)
      // this.reloadBaseItem();
      this.ensureBaseItemContents(this.baseItem)
    }
  }
}
</script>

<style scoped>

</style>
