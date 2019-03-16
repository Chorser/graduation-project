var Bmob = require('../../utils/bmob.js');
var app = getApp()

Page({
  data: {
    avatar: '',
    nickName: '',
    items: [
      { name: '男', value: '1', checked: 'true' },
      { name: '女', value: '2' },
    ],
    gender: ''
  },

  onShow: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        avatar: app.globalData.userInfo.avatarUrl || '',
        nickName: app.globalData.userInfo.nickName || '',
        gender: app.globalData.userInfo.gender || '1'
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
  },

  updateUserInfo: function () {
    var that = this;
    console.log("update user info")

    var u = Bmob.Object.extend('_User')
    var query = new Bmob.Query(u);
    var currentUser = Bmob.User.current()
    query.get(currentUser.id, {
      success: function (result) {
        console.log(result)
        result.set('nickName', that.nickName)
        result.set('userPic', that.avatar)
        // result.set('openid', openid)
        // result.set('gender', that.gender)
        result.save().then((res) => {
          currentUser.set('nickName', that.nickName)
          currentUser.set('userPic', that.avatar)
          // currentUser.set('gender', that.gender)
          Bmob.User._saveCurrentUser(currentUser)
        })
      }
    })
  },
})