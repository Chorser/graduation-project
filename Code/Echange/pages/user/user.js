var Bmob = require('../../utils/bmob.js');
var app = getApp()

Page({
  currentUser: null,
  data: {
    navbarData: {
      showCapsule: true, //是否显示左上角图标：1表示显示，0表示不显示
      title: "Echange·个人信息",
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

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
    // if (app.globalData.currentUser) {
    //   this.currentUser = app.globalData.currentUser;

    this.currentUser = Bmob.User.current();

      this.setData({
        avatarUrl: this.currentUser.get("avatar").url || '',
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
      // }
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
      count: 1, // 默认9
      sizeType: ['compressed'], // 指定是压缩图
      sourceType: ['album', 'camera'], // 指定来源是相册和相机
      success: function (res) {
        var urlArr = new Array();
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)

        that.setData({
          isSrc: true,
          avatarUrl: tempFilePaths
        })

    // wx.chooseImage({
    //   success: function(res) {
    //     var tempFilePaths = res.tempFilePaths;
    //     wx.saveFile({
    //       tempFilePath: tempFilePaths[0],
    //       success: function(res) {
    //         var savedFilePath = res.savedFilePath;
    //         // wx.setStorageSync('avatarUrl', savedFilePath);
    //         //头像
    //         that.setData({
    //           avatarUrl: savedFilePath
    //         });
    //       }
    //     });
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

    var User = Bmob.Object.extend('_User')
    var query = new Bmob.Query(User);
    query.get(this.currentUser.id, {
      success: function(result) {
        result.set('nickName', that.data.nickName)
        result.set('gender', that.data.gender)

        if (that.data.isSrc == true) {
          var url = that.data.avatarUrl;
          result.set('avatarUrl', that.data.avatarUrl[0])
          // console.log(url)
          var file = new Bmob.File(url, that.data.avatarUrl);
          file.save();
          result.set('avatar', file);
        }
        result.save().then((res) => {
          wx.showToast({
            title: '保存成功！',
          })

          that.currentUser.set('nickName', that.data.nickName)
          that.currentUser.set('avatarUrl', that.data.avatarUrl)
          that.currentUser.set('avatar', file)
          that.currentUser.set('gender', that.data.gender)
          Bmob.User._saveCurrentUser(that.currentUser);

          app.globalData.currentUser = Bmob.User.current();
          console.log(app.globalData.currentUser)
        })
      }
    })
  },
})