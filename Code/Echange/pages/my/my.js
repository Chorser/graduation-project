var app = getApp()

Page({
  data: {
    avatar: '',
    nickName: ''
  },

  onLoad: function () {
    if(!app.globalData.currentUser)
      app.globalData.currentUser = Bmob.User.current();
  },

  onShow: function (options) {
    if (app.globalData.currentUser)
      this.setData({
        avatar: app.globalData.currentUser.get("avatar").url ||'/images/avatar1.jpg',
        nickName: app.globalData.currentUser.get("nickName") || '未设置昵称'
      });
  },

  navTo: function (e) {
    var target = e.currentTarget.dataset.target;
    var _url = '/pages/' + target + '/' + target;
    wx.navigateTo({
      url: _url
    })
  },

})