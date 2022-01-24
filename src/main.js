import Vue from "vue";
import App from "./App.vue";
import store from "./store";

import { Select, Input, Button, Tabs, Collapse, message, Radio, Checkbox, InputNumber, Switch, Empty } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

Vue.config.productionTip = false;

Vue.use(Select);
Vue.use(Input);
Vue.use(Button);
Vue.use(Tabs);
Vue.use(Collapse);
Vue.use(Radio);
Vue.use(Checkbox);
Vue.use(InputNumber);
Vue.use(Switch);
Vue.use(Empty);
Vue.prototype.$message = message;

new Vue({
  store,
  render: (h) => h(App),
}).$mount("#app");
