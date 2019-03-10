var Bmob = require('../../utils/bmob.js');
const app = getApp()

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false
  },

  onLoad: function (options) {
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              // 用户已经授权过,不需要显示授权页面,所以不需要改变 hasUserInfo 的值
              that.setData({
                hasUserInfo: false,
                userInfo: app.globalData.userInfo
              });
            }
          });
        } else {
          // 用户没有授权, 改变 hasUserInfo 的值，显示授权页面
          that.setData({
            hasUserInfo: true
          });
        }
      }
    });
  },

  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    //Bmob.User.upInfo(e.detail.userInfo)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  
})