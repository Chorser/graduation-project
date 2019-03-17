var Bmob = require('../../utils/bmob.js');
var app = getApp()

Page({
  currentUser: Bmob.User.current(),
  data: {
    avatarUrl: '',
    nickName: '',
    gender: '',
    items: [
      { name: '男', value: '1', checked: 'true' },
      { name: '女', value: '2' },
    ]
  },

  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        avatar: app.globalData.userInfo.avatarUrl || '',
        nickName: app.globalData.userInfo.nickName || '',
        gender: app.globalData.userInfo.gender || '1'
      })
    }
  },

  //未点完成失去焦点复原（change优先于blur触发）
  // blurName: function (e) {
  //   this.setData({ nickName: app.globalData.userInfo.nickName || '' });
  // },

  changeName: function (e) {
    var name = e.detail.value.trim();
    if (name) {
      this.data.nickName = name;
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
            // wx.setStorageSync('avatarUrl', savedFilePath);
            app.globalData.userInfo.avatarUrl = savedFilePath;
            that.setData({ avatarUrl: savedFilePath });
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

  // 保存用户的修改
  updateUserInfo: function () {
    var that = this;
    console.log("update user info")

    var u = Bmob.Object.extend('_User')
    var query = new Bmob.Query(u);
    query.get(this.currentUser.id, {
      success: function (result) {
        result.set('nickName', that.data.nickName)
        result.set('avatarUrl', that.data.avatarUrl)
        result.set('gender', that.data.gender)

        result.save().then((res) => {
          wx.showToast({
            title: '保存成功！',
          })

          app.globalData.userInfo.nickName = that.data.nickName;
          app.globalData.userInfo.avatarUrl = that.data.avatarUrl;
          app.globalData.userInfo.gender = that.data.gender;

          // that.currentUser.set('nickName', that.data.nickName)
          // that.currentUser.set('avatarUrl', that.data.avatarUrl)
          // that.currentUser.set('gender', that.data.gender)
          Bmob.User._saveCurrentUser(that.currentUser)
          console.log(res)
          console.log(Bmob.User.current())
        })
      }
    })
  },
})