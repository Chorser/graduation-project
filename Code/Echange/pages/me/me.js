var Bmob = require('../../utils/bmob.js');
var app = getApp()

Page({

  data: {
    avatar: '',
    nickName: ''
  },

  onLoad: function (options) {
    this.setData({
      avatar: wx.getStorageSync('avatar') ||'https://yunlaiwu0.cn-bj.ufileos.com/teacher_avatar.png',
      name: wx.getStorageSync('name') || ''
    });
  },

  navTo: function (e) {
    var target = e.currentTarget.dataset.target;
    var _url = '/pages/' + target + '/' + target;
    wx.navigateTo({
      url: _url
    })
  }
})