import Vue from "vue";

import Pages from '@/apps/Pages/index.vue'
import Files from '@/apps/Files/index.vue'
import Office from '@/apps/Office/index.vue'
import Marketplace from '@/apps/Marketplace/index.vue'

import listify from '@/apps/util-views/components/listify/1.2.vue'
import loading from '@/apps/util-views/components/loading/index.vue'

Vue.component("Pages", Pages);
Vue.component("Files", Files)
Vue.component("Office", Office)
Vue.component("Marketplace", Marketplace)
Vue.component("listify", listify)
Vue.component("loading", loading)