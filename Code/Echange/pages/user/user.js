var Bmob = require('../../utils/bmob.js');

// 引入腾讯地图SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var mapManager = new QQMapWX({
  key: 'OZQBZ-O7UKU-LW4VZ-43PF2-NVGZ7-H4FNU'
});

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
    items: [{
        name: '男',
        value: 1,
        checked: 'true'
      },
      {
        name: '女',
        value: 2
      },
    ],

    school: ''
  },

  onLoad: function(options) {
    this.currentUser = app.globalData.currentUser;
    this.setData({
      avatarUrl: this.currentUser.get("avatar")._url || '',
      nickName: this.currentUser.get("nickName") || '',
      gender: this.currentUser.get("gender") || 1,
      school: this.currentUser.get("school") || ''
    })

    if (this.data.gender != 1) {
      this.setData({
        items: [{
            name: '男',
            value: 1
          },
          {
            name: '女',
            value: 2,
            checked: 'true'
          }
        ]
      })
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
      success: function(res) {
        var urlArr = new Array();
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)

        that.setData({
          isSrc: true,
          avatarUrl: tempFilePaths
        })
      }
    })
  },

  radioChange(e) {
    this.setData({
      gender: parseInt(e.detail.value)
    });
  },

  changeSchool() {
    var that = this;
    console.log(this.data.school)
    if (!this.data.school || this.data.school == '') {
      //获取当前位置
      mapManager.search({
        keyword: '大学',
        success: function (res) {
          console.log(res);
          var addresses = res.data;
          that.setData({
            school: addresses[0].title
          })
        },
        fail: function (res) {
          console.log(res.status, res.message);
        }

      // wx.getLocation({
      //   type: 'wgs84',
      //   success(res) {
      //     console.log(res)
      //     var latitude = res.latitude
      //     var longitude = res.longitude
      //     that.setData({
      //       latitude: res.latitude,
      //       longitude: res.longitude
      //     })
      //     // 调用接口转换成具体位置
      //     mapManager.reverseGeocoder({
      //       location: {
      //         latitude: res.latitude,
      //         longitude: res.longitude
      //       },
      //       success: function(res) {
      //         console.log(res.result);
      //         that.setData({
      //           school: res.result.formatted_addresses.recommend
      //         })
      //       },
      //       fail: function(res) {
      //         console.log(res);
      //       },
      //     })
      //   },
      //   fail: function(err) {
      //     console.log(err);
      //   },
      })
    }
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
        result.set('school', that.data.school)
        
        if (that.data.isSrc == true) {
          var url = that.data.avatarUrl;
          result.set('avatarUrl', that.data.avatarUrl[0])
          var file = new Bmob.File(url, that.data.avatarUrl);
          file.save();
          result.set('avatar', file);
        }
        result.save().then((res) => {
          console.log(res);
          wx.showToast({
            title: '保存成功！',
          })

          that.currentUser.set('nickName', that.data.nickName)
          that.currentUser.set('avatarUrl', that.data.avatarUrl)
          that.currentUser.set('avatar', file)
          that.currentUser.set('gender', that.data.gender)
          that.currentUser.set('school', that.data.school)
          Bmob.User._saveCurrentUser(that.currentUser);

          app.globalData.currentUser = Bmob.User.current();
        })
      }
    })
  },
})