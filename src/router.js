import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      redirect: "/store/shelf"
    },
    {
      path: "/ebook",
      component: () => import("./views/ebook/index.vue"),
      children: [
        {
          path: ":fileName",
          component: () => import("./components/ebook/EbookReader.vue")
        }
      ]
    },
    {
      path: "/store",
      component: () => import("./views/store/index.vue"),
      children: [
        {
          path: "shelf",
          component: () => import("./views/store/StoreShelf.vue")
        },
        {
          path: "category",
          component: () => import("./views/store/StoreCategory.vue")
        },
        {
          path: "home",
          component: () => import("./views/store/StoreHome.vue")
        },
        {
          path: "list",
          component: () => import("./views/store/StoreList.vue")
        },
        {
          path: "speaking",
          component: () => import("./views/store/StoreSpeaking.vue")
        },
        {
          path: "detail",
          component: () => import("./views/store/StoreDetail.vue")
        },
      ]
    }
  ]
});
