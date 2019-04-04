var Bmob = require('../../utils/bmob.js');
var app = getApp()

Page({
  currentUser: null,
  data: {
    avatarUrl: '',
    nickName: '',
    gender: 1,
    items: [
      {
        name: '男', value: 1, checked: 'true' },
      {
        name: '女',  value: 2 },
    ]
  },

  onLoad: function(options) {
    if (app.globalData.currentUser) {
      this.currentUser = app.globalData.currentUser;
      this.setData({
        avatarUrl: this.currentUser.get("avatarUrl") || '',
        nickName: this.currentUser.get("nickName") || '',
        gender: this.currentUser.get("gender") || 1
      })

      if (this.data.gender != 1) {
        this.setData({
          items: [
            {  name: '男', value: 1 },
            {  name: '女', value: 2, checked: 'true' }
          ]
        })
      }
    }

  },

  changeName: function(e) {
    var name = e.detail.value.trim();
    if (name) {
      this.data.nickName = name;
    }
  },

  changeAvatar: function(e) {
    var that = this;
    wx.chooseImage({
      success: function(res) {
        var tempFilePaths = res.tempFilePaths;
        wx.saveFile({
          tempFilePath: tempFilePaths[0],
          success: function(res) {
            var savedFilePath = res.savedFilePath;
            // wx.setStorageSync('avatarUrl', savedFilePath);
            //头像
            that.setData({
              avatarUrl: savedFilePath
            });
          }
        });
      }
    })
  },

  radioChange(e) {
    this.setData({
      gender: parseInt(e.detail.value)
    });
  },

  // 保存用户的修改
  updateUserInfo: function() {
    var that = this;
    console.log("update user info")

    var u = Bmob.Object.extend('_User')
    var query = new Bmob.Query(u);
    query.get(this.currentUser.id, {
      success: function(result) {
        result.set('nickName', that.data.nickName)
        result.set('avatarUrl', that.data.avatarUrl)
        result.set('gender', that.data.gender)

        result.save().then((res) => {
          wx.showToast({
            title: '保存成功！',
          })

          that.currentUser.set('nickName', that.data.nickName)
          that.currentUser.set('avatarUrl', that.data.avatarUrl)
          that.currentUser.set('gender', that.data.gender)
          Bmob.User._saveCurrentUser(that.currentUser)

          app.globalData.currentUser = Bmob.User.current();
          console.log(app.globalData.currentUser)
        })
      }
    })
  },
})