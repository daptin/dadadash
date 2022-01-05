<template>
  <q-page-container style="padding-top: 0; overflow: hidden;">
    <q-page id="page" style="min-height: 0;">
      <div class="row">
        <div class="col-8 col-xs-12 col-sm-12  offset-xs-0 offset-sm-0 ">

          <div id="qid"></div>

        </div>

      </div>


    </q-page>


    <q-dialog v-model="newNameDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <q-input label="New file name" v-model="newName"></q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn @click="newNameDialog = false" label="Cancel"></q-btn>
          <q-btn @click="newDocument()" color="primary" label="Create"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

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
          <q-input readonly :value="endpoint() + '/#/apps/document/' + document.reference_id"></q-input>
        </q-card-section>
      </q-card>

    </q-dialog>

    <q-dialog v-model="pageSettingDialog">
      <q-card>
        <q-card-section>
          <span class="text-h6">Page setting</span>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <div class="col-6 q-pa-xs">
              <!--              <q-input v-model="pageSetting.height" type="number" label="Page height"></q-input>-->
              <q-input v-model="pageSetting.width" type="number" label="Page width"></q-input>
            </div>
            <div class="col-6  q-pa-xs">
              <q-input v-model="pageSetting.margin.top" type="number" label="Margin top"></q-input>
              <q-input v-model="pageSetting.margin.left" type="number" label="Margin left"></q-input>
              <q-input v-model="pageSetting.margin.right" type="number" label="Margin right"></q-input>
              <q-input v-model="pageSetting.margin.bottom" type="number" label="Margin bottom"></q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page-container>


</template>
<style scoped>

@media print {
  .ql-toolbar.ql-snow {
    display: none !important;
    visibility: hidden !important;
  }

  #page {
    margin-left: -50px;
    margin-top: -50px;
    z-index: 999;
  }

  .ql-container.ql-snow {
    border: none !important;
  }

  .q-tab-panels {
    padding-top: 0 !important;
  }
}

.quill-editor {
  height: calc(100vh - 150px);
  width: 8.3in;
}

</style>
<script>

var randomColor = require('randomcolor'); // import the script

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import {mapActions, mapGetters} from "vuex";
// import '../../statics/ckeditor/ckeditor'
import JSZip from 'jszip'
import * as Y from 'yjs'
import {WebsocketProvider} from 'y-websocket'
import {QuillBinding} from 'y-quill';
// import { IndexeddbPersistence } from 'y-indexeddb';
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import {fromUint8Array, toUint8Array} from 'js-base64'
import ImageResize from 'quill-image-resize-module';
import {ImageDrop} from 'quill-image-drop-module';
import './sticky-toolbar';

Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/cursors', QuillCursors)

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


export default {

  name: "DocumentEditorApp",
  props: ["baseItem"],

  data() {
    return {
      ytext: null,
      ydoc: null,
      saveDebounced: null,
      quillEditorOption: {
        cursors: true,
        history: {
          userOnly: true
        },
        placeholder: 'Start collaborating...',
      },
      file: null,
      pageSettingDialog: false,
      pageSetting: {
        height: 800,
        width: 600,
        header: {
          style: {
            height: "100px",
            "width": "13cm"
          },
        },
        margin: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
        }
      },
      pageHeight: 1200,
      showSharingBox: false,
      ...mapGetters(['endpoint', 'decodedAuthToken', 'authToken']),
      contents: null,
      newNameDialog: false,
      newName: null,
      document: null,
      containerId: "id-" + new Date().getMilliseconds(),
      screenWidth: (window.screen.width < 1200 ? window.screen.width : 1200) + "px",
    }
  },
  watch: {
    'contents': function (newVal, oldVal) {
      // console.log("Contents changed", arguments)
    }
  },
  methods: {
    printDocument() {
      setTimeout(function () {
        window.print();
      }, 100)
    },
    logout() {
      this.$emit("logout");
    },


    loadEditor() {
      const that = this;


      setTimeout(function () {
        console.log("loading ckeditor", that.decodedAuthToken(), that.contents)

        const ydoc = new Y.Doc()
        let token = that.authToken();
        console.log("Token", token)
        let endpoint = that.endpoint();
        endpoint = endpoint.substring(endpoint.indexOf("//"))
        const provider = new WebsocketProvider(
          (window.location.protocol === "https:" ? "wss:" : "ws:")
          + '//' + endpoint + '/live/document/'
          + that.baseItem.reference_id + "/document_content",
          "yjs?token=" + token,
          ydoc
        );
        // const indexeddbProvider = new IndexeddbPersistence('y-indexeddb', ydoc)


        that.ydoc = ydoc;
        const ytext = ydoc.getText('quill')
        console.log("Yxml loaded", that.$refs.myQuillEditor, ytext);
        that.ytext = ytext;
        if (that.contents) {
          Y.applyUpdate(that.ydoc, toUint8Array(that.contents.encodedStateVector))
        }

        var editorContainer = document.getElementById("qid")

        const editor = new Quill(editorContainer, {
          modules: {
            imageResize: {},
            imageDrop: true,
            sticky_toolbar: true,
            cursors: true,
            toolbar: [
              [{'font': []}, {'size': []}],
              ['bold', 'italic', 'underline', 'strike'],
              [{'color': []}, {'background': []}],
              [{'script': 'super'}, {'script': 'sub'}],
              [{'header': '1'}, {'header': '2'}, 'blockquote', 'code-block'],
              [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
              ['direction', {'align': []}],
              ['link', 'image', 'video', 'formula'],
              ['clean']
            ],
            history: {
              userOnly: true
            }
          },
          placeholder: 'Start collaborating...',
          theme: 'snow' // or 'bubble'
        })

        const binding = new QuillBinding(ytext, editor, provider.awareness)

        provider.awareness.setLocalStateField('user', {
          name: that.decodedAuthToken().name,
          color: randomColor()
        })

        ytext.observe(function (event, transaction) {

          if (transaction.local) {
            console.log("local transaction, trigger save", event)
            that.saveDebounced();
          }
        })


      }, 100)

    },
    newDocument() {

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
      if (!this.newName.endsWith(".ddoc")) {
        this.newName = this.newName + ".ddoc"
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
        contents: "",
        name: newFileName,
        type: "text/html"
      }
      this.newName = null;
      this.newNameDialog = false;
      this.document.document_content = [this.file]
      this.contents = "";
      this.editor.setData("")
    },
    saveDocument() {
      const that = this;

      var zip = new JSZip();
      // console.log("save document", that.ytext.toString())
      let docString = JSON.stringify({
        plaintext: that.ytext.toString(),
        encodedStateVector: fromUint8Array(Y.encodeStateAsUpdate(that.ydoc))
      });
      // console.log("doc string", docString)
      zip.file("contents.json", docString);
      zip.file("page-setting.json", JSON.stringify(this.pageSetting));


      console.log("generate zip")
      zip.generateAsync({type: "base64"}).then(function (base64) {
        console.log("emit save event")

        that.$emit("save-base-item-contents", base64)
      }).catch(function (err) {
        console.log("Failed to generate zip file", err)
      });


    },
    ...mapActions(['loadData', 'updateRow', 'createRow'])
  },
  mounted() {
    const that = this;
    this.containerId = "id-" + new Date().getMilliseconds();
    this.saveDebounced = debounce(this.saveDocument, 3 * 1000, false)


    console.log("Loaded document", that.baseItem)
    that.file = that.baseItem.file;
    try {


      JSZip.loadAsync(atob(that.file)).then(function (zipFile) {
        // that.contents = atob(that.file.contents);
        zipFile.file("contents.json").async("string").then(function (data) {
          // data is "Hello World\n"
          // console.log("Loaded file: ", data)
          var persistedData = JSON.parse(data)
          that.contents = persistedData;
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
      console.log("Failed to read existing contents");
      that.loadEditor();
    }


  }
}
</script>
