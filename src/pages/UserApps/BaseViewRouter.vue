<template>

  <div>
    <q-tab-panels keep-alive v-model="baseItem.document_name">
      <q-tab-panel :key="item.reference_id" style="padding: 0" :name="item.document_name"
                   v-for="item in baseConfig.items">
        <component :is="baseItemComponentMap[item.document_extension]"
                   :baseItem="baseItemConfigMap[item.document_name]"
                   v-if="baseItemConfigMap[item.document_name]"
                   @save-base-item-contents="saveBaseItemContents"
        ></component>
      </q-tab-panel>
    </q-tab-panels>
  </div>

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
            var extendConfig = JSON.parse(atob(item.document_content[0].contents))
            baseItemConfig = {...item, ...extendConfig};
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
        that.baseItemConfigMap[item.document_name] = baseItemConfig;
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

      that.baseItemConfigMap[that.baseItem.document_name].file = baseEncodedFileItem;
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
    ...mapActions(['updateRow']),
  },

  data() {
    return {
      showComponent: true,
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
    that.reloadBaseItem();

    console.log("Base item config 1", that.baseItemConfig)

  },
  watch: {
    'baseItem': function (e) {
      // this.reloadBaseItem();
    }
  }
}
</script>

<style scoped>

</style>
