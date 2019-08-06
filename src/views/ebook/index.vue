<template>
  <div class="ebook" ref="ebook">

    <ebook-title></ebook-title>
  <ebook-reader></ebook-reader>
    <ebook-menu></ebook-menu>
    <ebook-bookmark></ebook-bookmark>
    <ebook-header></ebook-header>
    <ebook-footer></ebook-footer>

  </div>

</template>

<script>
  import EbookReader from '../../components/ebook/EbookReader.vue'
  import EbookTitle from '../../components/ebook/Ebooktitle.vue'
  import EbookMenu from '../../components/ebook/Ebookmenu.vue'
  import EbookBookmark from '../../components/ebook/EbookBookmark'
  import EbookHeader from  '../../components/ebook/EbookHeader'
  import EbookFooter from '../../components/ebook/EbookFooter'
  import {getReadTime, saveReadTime} from "../../utils/localStorage";

  import {ebookMixin} from "../../utils/mixin";

  export default {
    components: {
      EbookReader,
      EbookMenu,
      EbookTitle,
      EbookBookmark,
      EbookHeader,
      EbookFooter,
    },
    mixins:[ebookMixin],
    methods: {
      startLoopReadTime() {
        let readTime = getReadTime(this.fileName)
        if (!readTime) {
          readTime = 0
        }
        this.task = setInterval(() => {
          readTime++
          if (readTime % 30 === 0) {
            saveReadTime(this.fileName, readTime)
          }
        }, 1000)//调用定时任务
      },
      restore() {
        // 将组件还原回原位
        this.$refs.ebook.style.top = 0
        // 设置过渡动画，产生回弹效果
        this.$refs.ebook.style.transition = 'all .2s linear'
        setTimeout(() => {
          // 200毫秒动画结束后，将过渡动画关闭，否则在下拉时也会产生过渡动画
          this.$refs.ebook.style.transition = ''
        }, 200)
      },
      move(v) {
        // 向下拉动屏幕时，组件随之移动
        this.$refs.ebook.style.top = v + 'px'

      },
      mounted() {
        this.startLoopReadTime()
      },

    },
    beforeDestroy() {
      if (this.task) {
        clearInterval(this.task)
      }
    },
    watch: {
      // 监听用户下拉屏幕时滚动条的y轴数值
      offsetY(v) {
        // 判断如果菜单栏没有处于显示状态（如果菜单栏显示，优先响应菜单栏事件）
        // 并且电子书已经解析完毕（未解析完毕时无法获取currentLocation）
        if (!this.menuVisible && this.bookAvailable) {
          if (v > 0) {
            // 向下拉动屏幕时，调用move方法
            this.move(v)
          } else if (v === 0) {
            // y轴为0时，调用restore方法让屏幕回弹，松手时屏幕是无法自动回弹的，必须自己实现
            this.restore()
          }
        }
      }
    },
  }
</script>
<style lang="scss">
.ebook{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left:0;

}
</style>
