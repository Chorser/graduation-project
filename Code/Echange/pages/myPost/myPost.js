var Bmob = require('../../utils/bmob.js');
var app = getApp();

Page({

  data: {
    windowHeight: 0,
    windowWidth: 0,

    noticeList: [],
    limit: 10,
  },

  onLoad: function (options) {

  },

  onShow: function () {
    var that = this;
    if (this.data.noticeList.length == 0)
      this.getList();

    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },

  pullUpLoad: function (e) {
    var limit = that.data.limit + 2
    this.setData({
      limit: limit
    })
    this.onShow()
  },

  getList: function () {
    var that = this;
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);
    query.equalTo("userId", app.globalData.currentUser.id);
    query.descending('createdAt');
    query.limit(that.data.limit);

    query.find({
      success: function (results) {
        console.log(results);
        that.setData({
          noticeList: results
        })
      },
      error: function (error) {
        console.log("查询失败： ", error.code + " " + error.message);
      }
    })
  },

  toAddNotice: function () {
    wx.navigateTo({
      url: '../edit1/edit1',
    })
  }
})