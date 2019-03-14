var app = getApp()

Page({
  data: {
    avatar: '',
    nickName: ''
  },

  onLoad: function (options) {    
    this.setData({
      avatar: app.globalData.userInfo.avatarUrl ||'https://yunlaiwu0.cn-bj.ufileos.com/teacher_avatar.png',
      nickName: app.globalData.userInfo.nickName || '未设置昵称'
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