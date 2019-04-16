var Bmob = require('../../utils/bmob.js');
const app = getApp()

Page({
  data: {
    navbarData: {
      showCapsule: false, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·发布须知',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,
  },

  toPost: function () {
    wx.navigateTo({
      url: "/pages/edit1/edit1"
    })
  },

  buy: function () {

  }
})