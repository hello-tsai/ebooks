import Mock from 'mockjs'
import home from './bookHome.js'
import shelf from './bookShelf'
import list from './bookList'
import flatList from './bookFlatList'

Mock.mock(/\/book\/home/,'get',home)
Mock.mock(/\/book\/shelf/,'get',home)
Mock.mock(/\/book\/list/,'get',home)
Mock.mock(/\/book\/flat-list/,'get',home)
