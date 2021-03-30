import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$axios = axios;
import TableSideBar from '../pages/TableSideBar'
import TableEditor from '../pages/TableEditor'
import TablePermissions from '../pages/Permissions'
import HelpPage from '../pages/HelpPage'
import FileBrowser from 'pages/UserApps/FileBrowser.vue';
import SiteFileBrowser from 'pages/UserApps/SiteFileBrowser.vue';
import DaptinDocumentUploader from 'pages/UserApps/Components/DaptinDocumentUploader.vue';
import UserHeaderBar from "pages/UserApps/UserHeaderBar";
import GuestHeaderBar from "pages/UserApps/GuestHeaderBar";

const VueUploadComponent = require('vue-upload-component');
const AceEditor = require('vue2-ace-editor');
import VJstree from 'vue-jstree'
import PaginatedTableView from "pages/UserApps/PaginatedListViewTemplate/PaginatedTableView.vue";
import PaginatedCardView from "pages/UserApps/PaginatedListViewTemplate/PaginatedCardView.vue";
import NewWorkspaceScreen from "pages/UserApps/NewWorkspaceScreen.vue";
import WorkspaceView from "pages/UserApps/WorkspaceView.vue";
import AddBaseView from "pages/UserApps/AddBaseView.vue";
import BaseViewRouter from "pages/UserApps/BaseViewRouter.vue";
import EditDataTableComponent from "pages/UserApps/Components/EditDataTableComponent.vue";
import CalendarComponent from "pages/UserApps/Calendar.vue";
import DocumentEditorComponent from "pages/UserApps/DocumentEditor.vue";
import MermaidGraphEditor from "pages/UserApps/MermaidGraphEditor";
import SpreadsheetEditor from "pages/UserApps/SpreadsheetEditor";
import HorizontalScroll from 'vue-horizontal-scroll'
// import FlowyPlugin from "@hipsjs/flowy-vue";


import VueCodemirror from 'vue-codemirror'
import DataActionBlock from "pages/Components/DataActionBlock";
import DataActionNode from "pages/Components/DataActionNode";
// import VueAutosuggest from "vue-autosuggest";

// import VueQuillEditor from 'vue-quill-editor'
// import QuillCursors from 'quill-cursors'
// import Quill from 'quill';

// Quill.register('modules/cursors', QuillCursors)


// Vue.use(VueQuillEditor, /* { default global options } */)
// Vue.use(VueAutosuggest);

Vue.component('data-action-block', DataActionBlock)
Vue.component('data-action-node', DataActionNode)

Vue.use(VueCodemirror)

// Vue.use(FlowyPlugin);
Vue.component('vue-horizontal-scroll', HorizontalScroll);
Vue.component('v-jstree', VJstree);
Vue.component('ace-editor', AceEditor);
Vue.component('user-header-bar', UserHeaderBar);
Vue.component('guest-header-bar', GuestHeaderBar);
Vue.component('new-workspace-screen', NewWorkspaceScreen);
Vue.component('workspace-view', WorkspaceView);
Vue.component('add-base-view', AddBaseView);
Vue.component('base-view-router', BaseViewRouter);
Vue.component('calendar-view', CalendarComponent);
Vue.component('document-editor', DocumentEditorComponent);
Vue.component('mermaid-graph-editor', MermaidGraphEditor);
Vue.component('spreadsheet-editor', SpreadsheetEditor);
Vue.component('edit-data-table', EditDataTableComponent);
Vue.component('file-upload', VueUploadComponent);
Vue.component('daptin-document-uploader', DaptinDocumentUploader);
Vue.component('file-browser', FileBrowser);
Vue.component('site-file-browser', SiteFileBrowser);
Vue.component("table-side-bar", TableSideBar);
Vue.component("table-permissions", TablePermissions);
Vue.component("table-editor", TableEditor);
Vue.component("paginated-table-view", PaginatedTableView);
Vue.component("paginated-card-view", PaginatedCardView);
Vue.component("help-page", HelpPage);
// Vue.component("tiny-mce", Editor);


