<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div
      class="ebook-reader-mask"
      @click="onMaskclick"
      @touchmove="move"
      @touchend="moveend"
      @mousedown.left="onMouseEnter"
      @mousemove.left="onMouseMove"
      @mouseup.left="onMouseEnd"
    ></div>
  </div>
</template>

<script>
  import { ebookMixin } from '../../utils/mixin.js'
  import Epub from 'epubjs'
  import {
     getFontFamily,
     getFontSize, getLocation, getTheme,
     saveFontFamily,
     saveFontSize, saveTheme,
  } from "../../utils/localStorage";
  import {flatten} from "../../utils/book";
  import {getLocalForage} from "../../utils/localForage";

  global.ePub = Epub

  export default {
     name:'EbookReader',
    mixins: [ebookMixin],
    methods: {
       //鼠标松开时
       onMouseEnd(e) {
          if (this.mouseState === 2) {
             this.setOffsetY(0)
             this.firstOffsetY = null
             this.mouseState = 3
          } else {
             this.mouseState = 4
          }
          const time = e.timeStamp - this.mouseStartTime
          if (time < 100) {
             this.mouseState = 4
          }
          e.preventDefault()
          e.stopPropagation()
       },
       //鼠标移动时
       onMouseMove(e) {
          if (this.mouseState === 1) {
             this.mouseState = 2
          } else if (this.mouseState === 2) {
             let offsetY = 0
             if (this.firstOffsetY) {
                offsetY = e.clientY - this.firstOffsetY
                this.setOffsetY(offsetY)
             } else {
                this.firstOffsetY = e.clientY
             }
          }
          e.preventDefault()
          e.stopPropagation()
       },
       //鼠标点击时
       onMouseEnter(e) {
          this.mouseState = 1
          this.mouseStartTime = e.timeStamp
          e.preventDefault()
          e.stopPropagation()
       },
       onMaskclick(e){
          const offsetX = e.offsetX
          const width =window.innerWidth
          if(offsetX>0 && offsetX<width*0.3){
             this.prevPage()
          }else if(offsetX>0 && offsetX>width*0.7){
             this.nextPage()
          }else{
             this.toggleTitleAndMenu()
          }

       },//点击左边翻上页面，点击右边下一页，点击中间出现菜单
       move(e) {
          let offsetY = 0
          if (this.firstOffsetY) {
             offsetY = e.changedTouches[0].clientY - this.firstOffsetY
             this.setOffsetY(offsetY)
          } else {
             this.firstOffsetY = e.changedTouches[0].clientY
          }
          e.preventDefault()
          e.stopPropagation()

       },
       moveend() {
          this.setOffsetY(0)
          this.firstOffsetY = null
       },


      prevPage () {
        if (this.rendition) {
          this.rendition.prev().then(()=>{
             this.refreshLocation()
          })
          this.hideTitleAndMenu()
        }
      },
      nextPage () {
 if (this.rendition) {
        this.rendition.next().then(()=>{
           this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
},
      toggleTitleAndMenu () {
         if(this.menuVisible)
        {
            this.setSettingVisible(-1)
         }
         this.setMenuVisible(!this.menuVisible)
         this.setFontFamilyVisible(false)
      },


       //封装函数使结构更清晰
       initFontFamily(){
          let font = getFontFamily(this.fileName)
          if (!font){
             saveFontFamily(this.fileName,this.defaultFontFamily)
          }else{
             this.rendition.themes.font(font)//加载缓存的字体
             this.setDefaultFontFamily(font)
          }//更改默认字体m
       },
       initFontSize(){
          let fontSize = getFontSize(this.fileName)
          if (!fontSize){
             saveFontSize(this.fileName,this.defaultFontSize)
          }else{
             this.rendition.themes.fontSize(fontSize)//加载缓存的字号
             this.setDefaultFontSize(fontSize)
          }//更改默认字号
       },
       initTheme() {
          let defaultTheme = getTheme(this.fileName)
          if (!defaultTheme) {
             defaultTheme = this.themeList[0].name
             saveTheme(this.fileName, defaultTheme)
          }
          this.setDefaultTheme(defaultTheme)
          this.themeList.forEach(theme => {
             this.rendition.themes.register(theme.name, theme.style)
          })
          this.rendition.themes.select(defaultTheme)

       },
       initRendition(){
          this.rendition = this.book.renderTo('read', {
             width: innerWidth,
             height: innerHeight
             // method: 'default'
          })
          const location =getLocation(this.fileName)
          this.display(location,()=>{
             this.initFontFamily()
             this.initFontSize()
             this.initTheme()
             this.initGlobalStyle()
          })
          this.rendition.hooks.content.register(contents => {

             contents.addStylesheet( `${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`)
             contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`)
             contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`)
             contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)

          })
       },
       // initGesture(){
       //    this.rendition.on('touchstart', event => {
       //       this.touchstartX = event.changedTouches[0].clientX
       //       this.touchstartTime = event.timeStamp
       //    })
       //    this.rendition.on('touchend', event => {
       //       const offsetX = event.changedTouches[0].clientX - this.touchstartX
       //       const time = event.timeStamp - this.touchstartTime
       //       if (time < 500 && offsetX > 40) {
       //          this.prevPage()
       //       } else if (time < 500 && offsetX < -40) {
       //          this.nextPage()
       //       } else {
       //          this.toggleTitleAndMenu()
       //       }
       //       event.stopPropagation()
       //    })
       // },
       parseBook() {
          this.book.loaded.cover.then(cover => {
             this.book.archive.createUrl(cover).then(url => {
                this.setCover(url)
             })
          })
          this.book.loaded.metadata.then(metadata => {
             this.setMetadata(metadata)
          })
          this.book.loaded.navigation.then(nav => {
             const navItem = flatten(nav.toc)

             function find(item, level = 0) {
                return !item.parent ? level : find(navItem.filter(parentItem => parentItem.id === item.parent)[0], ++level)
             }

             navItem.forEach(item => {
                item.level = find(item)
             })
             this.setNavigation(navItem)
          })
       },
       initEpub(url) {

          this.book = new Epub(url)
          this.setCurrentBook(this.book)
          this.initRendition()
          // this.initGesture()
          this.parseBook()
          this.book.ready.then(() => {
             return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
          }).then(locations => {
             this.navigation.forEach(nav => {
                nav.pagelist = []
             })
             locations.forEach(item => {
                const loc = item.match(/\[(.*)\]!/)[1]
                this.navigation.forEach(nav => {
                   if (nav.href) {
                      const href = nav.href.match(/^(.*)\.html$/)
                      if (href) {
                         if (href[1] === loc) {
                            nav.pagelist.push(item)
                         }
                      }
                   }
                })
                let currentPage = 1
                this.navigation.forEach((nav, index) => {
                   if (index === 0) {
                      nav.page = 1
                   } else {
                      nav.page = currentPage
                   }
                   currentPage += nav.pagelist.length + 1
                })
             })
             this.setPagelist(locations)
             this.setBookAvailable(true)
             this.refreshLocation()
          })
       }

    },
  mounted () {
     const books = this.$route.params.fileName.split('|')
     const fileName = books[1]
     getLocalForage(fileName, (err, blob) => {
        if (!err && blob) {
           this.setFileName(books.join('/')).then(() => {
              this.initEpub(blob)
           })
        } else {
           this.setFileName(books.join('/')).then(() => {
              const url = process.env.VUE_APP_EPUB_URL + '/' + this.fileName + '.epub'
              this.initEpub(url)
           })
        }
     })
  }



  }
</script>

<style lang="scss" scoped>
@import "../../assets/style/global.scss";
.ebook-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ebook-reader-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 150;
    top: 0;
    left: 0;
  }
}
</style>
