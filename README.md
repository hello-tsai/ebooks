# ebooks
## 思路方法：
运用动态路由获得nginx服务器上获取电子书的下载路径
通过epubjs解析和渲染电子书
利用rendition.on来动态绑定事件到iframe上来实现翻页
标题和菜单
解开组建的强关联
只需改变vuex中的值
通过 this.book.rendition.them.fontsize来改变阅读器中字体的大小
改变字体的样式，不能直接通过rendition
所以只能通过  this.rendition.hooks.content.register的contents.addStylesheet来添加字体样式且只能是通过URL来添加
下载 web-storage-cache这个库做字体和字号的缓存,这个库使对象编程json进行储存，让页面即使刷新了 字体字号也会保存。

通过加载vue-i8n插件来实现国际化，通过$t选定国际化文本传入key值