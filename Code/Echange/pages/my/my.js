var app = getApp()

Page({
  data: {
    navbarData: {
      showCapsule: false, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·我的',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

    avatar: '',
    nickName: ''
  },

  onShow: function(options) {
    this.currentUser = app.globalData.currentUser;
    
    // console.log(this.currentUser)
    var avatarUrl = null;
    if (this.currentUser.get("avatar")) {
      avatarUrl = this.currentUser.get("avatar")._url;
    } else {
      avatarUrl = this.currentUser.get("avatarUrl") || '/images/avatar1.jpg';
    }
    this.setData({
      avatar: avatarUrl,
      nickName: app.globalData.currentUser.get("nickName") || '未设置昵称'
    });
  },

  navTo: function(e) {
    var target = e.currentTarget.dataset.target;
    var _url = '/pages/' + target + '/' + target;
    wx.navigateTo({
      url: _url
    })
  },

})