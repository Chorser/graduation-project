var app = getApp()

Page({
  data: {
    avatar: '',
    nickName: '',
    items: [
      { name: '男', value: 'man', checked: 'true' },
      { name: '女', value: 'woman' },
    ],
    gender: ''
  },

  onShow: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        avatar: app.globalData.userInfo.avatarUrl || '',
        nickName: app.globalData.userInfo.nickName || '',
        gender: app.globalData.userInfo.gender || 'man'
      })
    }
  },

  //未点完成失去焦点复原（change优先于blur触发）
  blurName: function (e) {
    this.setData({ nickName: app.globalData.userInfo.nickName || '' });
  },

  changeName: function (e) {
    var name = e.detail.value.trim();
    if (name) {
      app.globalData.userInfo.nickName = name;
      // wx.setStorageSync('nickName', name);
    }
  },

  changeAvatar: function (e) {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.saveFile({
          tempFilePath: tempFilePaths[0],
          success: function (res) {
            var savedFilePath = res.savedFilePath;
            // wx.setStorageSync('avatar', savedFilePath);
            app.globalData.userInfo.avatarUrl = savedFilePath;
            that.setData({ avatar: savedFilePath });
          }
        });
      }
    })
  },

  radioChange(e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      gender: e.detail.value
    });
  }
})