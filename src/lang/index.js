import Vue from 'vue'
import VueI18N from  'vue-i18n'
import en from './en'
import cn from './cn'
import {getLocale, saveLocale} from "../utils/localStorage";
Vue.use(VueI18N)
const messages = {
    en,
    cn,
}
let locale = getLocale()
if(!locale){
    locale = 'cn'
    saveLocale(locale)
}
//获得默认语言
const i18n = new VueI18N({
    locale,
    messages
})//实例化一个i18n

export default i18n
