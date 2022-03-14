import Vue from "vue";
import App from "./App.vue";
import store from "./store";

import { Select, Input, Button, Tabs, Collapse, message, Radio, Checkbox, InputNumber, Switch, Empty, Icon, Divider, Tooltip } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import './assets/icons/iconfont/iconfont.css';
// import Mycollapse from "./components/Mycollapse/Index.vue";
// import Mycollapsepanel from "./components/Mycollapsepanel/Index.vue";
import Varunit from "./components/Varunit/Index.vue";
import Newcollapse from "./components/Newcollapse/Index.vue";
import Newcollapsepanel from "./components/Newcollapsepanel/Index.vue";

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
Vue.use(Icon);
Vue.use(Divider);
Vue.use(Tooltip);
// Vue.component(Mycollapse.name, Mycollapse);
// Vue.component(Mycollapsepanel.name, Mycollapsepanel);
Vue.component(Varunit.name, Varunit);
Vue.component(Newcollapse.name, Newcollapse);
Vue.component(Newcollapsepanel.name, Newcollapsepanel);
Vue.prototype.$message = message;

new Vue({
  store,
  render: (h) => h(App),
}).$mount("#app");
