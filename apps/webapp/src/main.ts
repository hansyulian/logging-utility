import { createApp } from "vue";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css"; // <-- Required for mdi icons
import "vue3-json-viewer/dist/vue3-json-viewer.css";
import JsonViewer from "vue3-json-viewer";

// Components
import App from "./App.vue";

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
  },
  components,
  directives,
});
const app = createApp(App);
app.use(vuetify);
app.use(JsonViewer);
app.mount("#app");
