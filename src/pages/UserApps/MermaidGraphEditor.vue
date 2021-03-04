<template>

  <q-page-container style="padding-top: 0">
    <q-page style="height:calc(100vh  - 75px);">
      <div class="row">
        <div style="border-left: 1px solid black" class="col-12">
          <div class="row">
            <div class="col-4 print-hide">
              <div class="row">
                <div class="col-12 q-pa-sm">
                  <q-btn color="dark" label="Insert diagram template">

                    <q-menu auto-close fit>
                      <q-list style="min-width: 100px">
                        <q-item clickable @click="setDiagramFromTemplate(template)"
                                v-for="template in diagramTemplates">
                          <q-item-section>{{ template.name }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
                <div class="col-12 q-pa-sm">
                  <textarea style="width: 100%; height: calc(100vh - 200px)" @keyup="updateDiagram()"
                            v-model="diagramSpec">
              </textarea>
                </div>
              </div>

            </div>
            <div class="col-8 q-pa-sm" style="height: calc(100vh - 100px);">
              <div class="mermaid" style="height: calc(100vh - 200px)">
              </div>
            </div>
          </div>
        </div>

      </div>
    </q-page>
  </q-page-container>


</template>
<style>

</style>
<script>
import mermaid from 'mermaid';
import {mapActions} from "vuex";

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

  name: "MermaidGraphEditor",
  data() {
    return {
      showSideBar: true,
      diagramSpec: 'sequenceDiagram\n' +
        '                participant Alice\n' +
        '                participant Bob\n' +
        '                Alice->>John: Hello John, how are you?\n' +
        '                loop Healthcheck\n' +
        '                John->>John: Fight against hypochondria\n' +
        '                end\n' +
        '                Note right of John: Rational thoughts <br/>prevail...\n' +
        '                John-->>Alice: Great!\n' +
        '                John->>Bob: How about you?\n' +
        '                Bob-->>John: Jolly good!',
      viewParameters: {
        tableName: 'document'
      },
      diagramTemplates: [
        {
          name: 'Sequence Diagram',
          template: 'sequenceDiagram\n' +
            '                participant Alice\n' +
            '                participant Bob\n' +
            '                Alice->>John: Hello John, how are you?\n' +
            '                loop Healthcheck\n' +
            '                John->>John: Fight against hypochondria\n' +
            '                end\n' +
            '                Note right of John: Rational thoughts <br/>prevail...\n' +
            '                John-->>Alice: Great!\n' +
            '                John->>Bob: How about you?\n' +
            '                Bob-->>John: Jolly good!'
        },
        {
          name: 'Flow Chart',
          template: 'graph TD\n' +
            '    A[Christmas] -->|Get money| B(Go shopping)\n' +
            '    B --> C{Let me think}\n' +
            '    C -->|One| D[Laptop]\n' +
            '    C -->|Two| E[iPhone]\n' +
            '    C -->|Three| F[fa:fa-car Car]'
        },
        {
          name: 'Class Diagram',
          template: 'classDiagram\n' +
            '    Animal <|-- Duck\n' +
            '    Animal <|-- Fish\n' +
            '    Animal <|-- Zebra\n' +
            '    Animal : +int age\n' +
            '    Animal : +String gender\n' +
            '    Animal: +isMammal()\n' +
            '    Animal: +mate()\n' +
            '    class Duck{\n' +
            '      +String beakColor\n' +
            '      +swim()\n' +
            '      +quack()\n' +
            '    }\n' +
            '    class Fish{\n' +
            '      -int sizeInFeet\n' +
            '      -canEat()\n' +
            '    }\n' +
            '    class Zebra{\n' +
            '      +bool is_wild\n' +
            '      +run()\n' +
            '    }\n' +
            '            '
        },
        {
          name: 'State Diagram',
          template: 'stateDiagram-v2\n' +
            '    [*] --> Still\n' +
            '    Still --> [*]\n' +
            '    Still --> Moving\n' +
            '    Moving --> Still\n' +
            '    Moving --> Crash\n' +
            '    Crash --> [*]\n' +
            '            '
        },
        {
          name: 'Gantt Chart',
          template: 'gantt\n' +
            '    title A Gantt Diagram\n' +
            '    dateFormat  YYYY-MM-DD\n' +
            '    section Section\n' +
            '    A task           :a1, 2014-01-01, 30d\n' +
            '    Another task     :after a1  , 20d\n' +
            '    section Another\n' +
            '    Task in sec      :2014-01-12  , 12d\n' +
            '    another task      : 24d\n' +
            '            '
        },
        {
          name: 'Pie Chart',
          template: 'pie title Pets adopted by volunteers\n' +
            '    "Dogs" : 386\n' +
            '    "Cats" : 85\n' +
            '    "Rats" : 15\n' +
            '            '
        },
        {
          name: 'ER Diagram',
          template: 'erDiagram\n' +
            '          CUSTOMER }|..|{ DELIVERY-ADDRESS : has\n' +
            '          CUSTOMER ||--o{ ORDER : places\n' +
            '          CUSTOMER ||--o{ INVOICE : "liable for"\n' +
            '          DELIVERY-ADDRESS ||--o{ ORDER : receives\n' +
            '          INVOICE ||--|{ ORDER : covers\n' +
            '          ORDER ||--|{ ORDER-ITEM : includes\n' +
            '          PRODUCT-CATEGORY ||--|{ PRODUCT : contains\n' +
            '          PRODUCT ||--o{ ORDER-ITEM : "ordered in"\n' +
            '            '
        },
      ],
      containerId: "id-" + new Date().getMilliseconds(),
      screenWidth: (window.screen.width < 1200 ? window.screen.width : 1200) + "px",
      eventMap: {},
      originalDiagram: null,
      debouncedSave: null,
    }
  },
  methods: {
    setDiagramFromTemplate(template) {
      this.diagramSpec = template.template;
      this.updateDiagram();
      this.saveDiagram();
    },
    saveDiagram() {
      const that = this;
      // console.log("save diagram", that.baseItem)
      if (that.originalDiagram === that.diagramSpec) {
        return
      }
      that.originalDiagram = that.diagramSpec;
      let diagram = JSON.stringify({
        diagramSpec: that.diagramSpec
      });
      console.log("save diagram")
      that.$emit("save-base-item-contents", btoa(diagram))
    },
    updateDiagram() {
      const that = this;
      var element = document.querySelector(".mermaid");
      var insertSvg = function (svgCode, bindFunctions) {
        element.innerHTML = svgCode;
      };
      that.calendar = mermaid.mermaidAPI.render('mermaid', this.diagramSpec, insertSvg);
      that.debouncedSave()
    },
    ...mapActions(['createRow', "loadData", "updateRow"]),
  },
  computed: {},

  watch: {},
  props: ["baseItem"],
  mounted() {
    const that = this;
    that.containerId = "id-" + new Date().getMilliseconds();
    console.log("Mounted Mermaid Graph Editor", that.containerId, this.baseItem);
    const file = this.baseItem.file;
    console.log("File: ", JSON.stringify(file));
    let mermaidEditorConfig = {};
    if (file) {
      try {
        mermaidEditorConfig = JSON.parse(atob(file));
        that.diagramSpec = mermaidEditorConfig.diagramSpec;
        that.originalDiagram = mermaidEditorConfig.diagramSpec;
        console.log("Restore saved diagram", mermaidEditorConfig)
      } catch (e) {
        console.log("Failed to parse existing data", e)
      }
    }
    that.mermaidEditorConfig = mermaidEditorConfig;


    that.debouncedSave = debounce(that.saveDiagram, 300, false)
    setTimeout(function () {
      console.log("initialize mermaid")
      mermaid.mermaidAPI.initialize({
        startOnLoad: false
      });
      that.updateDiagram()
    }, 200)
  }
}
</script>
