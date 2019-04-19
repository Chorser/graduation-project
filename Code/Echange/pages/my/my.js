var app = getApp()

Page({
  data: {
    avatar: '',
    nickName: ''
  },

  onShow: function (options) {
    this.currentUser = app.globalData.currentUser;
    if (this.currentUser)
      this.setData({
        avatar: this.currentUser.get("avatarUrl") ||'/images/avatar1.jpg',
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