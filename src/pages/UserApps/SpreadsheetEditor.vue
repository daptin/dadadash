<template>
  <q-page-container style="padding-top: 0;">

    <q-page style="overflow: hidden; height:calc(100vh  - 38px); min-height: 0">
      <div id="luckysheet"
           style="margin:0px;padding:0px;position:absolute;width:100%; height:calc(100vh - 28px); left: 0px; top: -21px"></div>

      <q-dialog v-model="newNameDialog">
        <q-card style="min-width: 400px">
          <q-card-section>
            <q-input label="New file name" v-model="newName"></q-input>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn @click="newNameDialog = false" label="Cancel"></q-btn>
            <q-btn @click="newDocument()" label="Create"></q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
    <q-dialog v-model="showSharingBox" v-if="document">
      <q-card style="min-width: 33vw; width: 43vw">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="fas fa-link" size="1.8em"></q-icon>
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <span class="text-h6">Share</span>
          </q-item-section>
        </q-item>
        <q-separator/>
        <q-card-section>
          <q-btn-toggle @input="saveDocument()" v-model="document.permission" :options="[
            {
             value: 2097027,
             label: 'Enable'
            },
            {
             value: 16289,
             label: 'Disable'
            }
          ]">
          </q-btn-toggle>
        </q-card-section>
        <q-card-section v-if="document.permission === 2097027">
          <span class="text-bold">Sharing by link</span>
        </q-card-section>
        <q-card-section v-if="document.permission === 2097027">
          <!--          <q-input readonly :value="endpoint() + '/asset/document/' + document.reference_id + '/document_content.' + document.document_extension"></q-input>-->
          <q-input readonly :value="endpoint() + '/#/apps/spreadsheet/' + document.reference_id"></q-input>

        </q-card-section>
      </q-card>

    </q-dialog>


  </q-page-container>
</template>

<style>
@import "src/static/luckysheet/css/luckysheet.css";
@import "src/static/luckysheet/plugins/css/pluginsCss.css";
@import "src/static/luckysheet/plugins/plugins.css";
@import "src/static/luckysheet/assets/iconfont/iconfont.css";

.q-layout__shadow::after {
  box-shadow: none;
}

.luckysheet-work-area {
  /*height: 41px !important;*/
  top: 27px;
}

/**/
/*.luckysheet-grid-container {*/
/*  top: 64px !important;*/
/*}*/

/*div.luckysheet-grid-container.luckysheet-scrollbars-enabled {*/
/*  top: 65px !important;*/
/*}*/

</style>
<script>
import {mapActions, mapGetters} from "vuex";
import JSZip from "jszip";


// import "../../statics/luckysheet/luckysheet.umd.js"
// import "../../statics/luckysheet/plugins/js/plugin.js"

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function encodeUnicode(str) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
}


function decodeUnicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export default {

  name: "SpreadsheetEditorApp",
  props: ["baseItem"],

  data() {
    return {
      file: null,
      ...mapGetters(['decodedAuthToken', 'endpoint']),
      saveDebounced: null,
      showSharingBox: false,
      contents: "",
      loading: true,
      newNameDialog: false,
      newName: null,
      document: null,
      containerId: "id-" + new Date().getMilliseconds(),
      screenWidth: (window.screen.width < 1200 ? window.screen.width : 1200) + "px",
    }
  },
  watch: {
    'contents': function (newVal, oldVal) {
      if (this.loading) {
        return
      }
      console.log("Contents changed", arguments)
      // this.saveDebounced();
    }
  },
  methods: {
    logout() {
      this.$emit("logout");
    },
    loadEditor() {
      const that = this;
      if (that.saveDebounced === null) {
        that.saveDebounced = debounce(that.saveDocument, 300, false)
      }

      setTimeout(function () {

        console.log("Create sheet")
        var options = {
          container: 'luckysheet', //luckysheet is the container id
          showinfobar: false,
          title: that.document ? that.document.document_name : "New document",
          userInfo: that.decodedAuthToken() !== null ? that.decodedAuthToken().email : 'Anonymous',
          hook: {
            cellEditAfter: function () {
              console.log("Cell edited")
            },
            cellRenderAfter: function () {
              // console.log("Cell red");

              that.saveDebounced();
            },
          }
        }
        // console.log("l", luckysheet)

        luckysheet.destroy();
        if (that.contents.length > 0) {
          try {
            // console.log("set string data", that.contents)
            var item = that.contents;
            if (!item) {
              // item = workingData
            } else {
              item = JSON.parse(item)
            }

            if (item) {
              options.data = item;
              // luckysheet.buildGridData(item)
            }
            console.log("set sheet data", item)
            luckysheet.create(options);

          } catch (e) {
            console.log("Failed to parse data", e);
            luckysheet.create(options);
          }
        } else {
          console.log("Else just create")
          luckysheet.create(options);
        }
        if (that.decodedAuthToken() === null) {
          return;
        }

      }, 300)
    },
    saveDocumentState() {
      const that = this;
      // let newData = luckysheet.getluckysheetfile();
      // newData = newData.map(function (sheet) {
      //   console.log("Get grid data for sheet", sheet)
      // sheet.celldata = luckysheet.getGridData(sheet.data)
      // delete sheet.data
      // return sheet;
      // })
      let value = luckysheet.toJson();
      console.log("sheet json", value);
      that.contents = JSON.stringify(value);
      window.localStorage.setItem("d", that.contents)


    },
    newDocument() {
      const that = this;
      if (!this.newNameDialog) {
        this.newNameDialog = true;
        return;
      }

      if (!this.newName) {
        this.$q.notify({
          message: "Please enter a name"
        });
        return
      }
      if (!this.newName.endsWith(".dsheet")) {
        this.newName = this.newName + ".dsheet"
      }

      var newFileName = null;
      newFileName = this.newName;

      this.document = {
        document_name: newFileName,
        document_extension: "html",
        mime_type: "text/html",
        document_path: localStorage.getItem("_last_current_path") || "/"
      }

      this.file = {
        contents: that.contents,
        name: newFileName,
        type: "text/json"
      }
      this.newName = null;
      this.newNameDialog = false;
      this.document.document_content = [this.file]
    },
    saveDocument() {
      const that = this;
      if (this.decodedAuthToken() === null) {
        return
      }

      that.loading = false;
      let newData = luckysheet.getluckysheetfile();
      if (!newData) {
        return
      }
      newData = newData.map(function (sheet) {
        // console.log("Get grid data for sheet", sheet)
        sheet.celldata = luckysheet.getGridData(sheet.data)
        // delete sheet.data
        return sheet;
      })
      var newContents = JSON.stringify(newData);
      that.contents = newContents;
      window.localStorage.setItem("d", newContents)


      var zip = new JSZip();
      zip.file("contents_encoded.json", encodeUnicode(this.contents));

      zip.generateAsync({type: "base64"}).then(function (base64) {
        that.$emit("save-base-item-contents", base64)
      })


    },
    ...mapActions(['loadData', 'updateRow', 'createRow'])
  },
  mounted() {
    const that = this;


    var script1 = document.createElement("script");
    script1.setAttribute("type", "text/javascript");
    script1.setAttribute("src", "/statics/luckysheet/plugins/js/plugin.js");
    document.getElementsByTagName("head")[0].appendChild(script1);

    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", "/statics/luckysheet/luckysheet.umd.js");

    document.getElementsByTagName("head")[0].appendChild(script);
    script.onload = function () {
      console.log("lucky loaded");

      that.containerId = "id-" + new Date().getMilliseconds();
      that.file = that.baseItem.file;

      try {


        JSZip.loadAsync(atob(that.file)).then(function (zipFile) {
          // that.contents = atob(that.file.contents);
          zipFile.file("contents_encoded.json").async("string").then(function (data) {
            // console.log("Loaded file: ", data)
            that.contents = decodeUnicode(data);
            that.loadEditor()
          }).catch(function (err) {
            console.log("Failed to open contents.html", err)
            that.loadEditor()
          });


        }).catch(function (err) {
          console.log("Failed to load zip file", err)
          that.loadEditor()
        });
      } catch (e) {
        console.log("Failed to read existing file contens");
        that.loadEditor();
      }


    }


  }
}
</script>
