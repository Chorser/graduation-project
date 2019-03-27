var app = getApp()

Page({
  data: {
    avatar: '',
    nickName: ''
  },

  onShow: function (options) {
    if (app.globalData.currentUser)
      this.setData({
        avatar: app.globalData.currentUser.get("avatarUrl") ||'https://yunlaiwu0.cn-bj.ufileos.com/teacher_avatar.png',
        nickName: app.globalData.currentUser.get("nickName") || '未设置昵称'
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