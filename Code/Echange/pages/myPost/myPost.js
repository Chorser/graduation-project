var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
var app = getApp();

Page({

  data: {
    windowHeight: 0,
    windowWidth: 0,

    noticeList: [],
    limit: 10,
    totalCount: 0, //我的发布总数
  },

  onLoad: function (options) {
    this.user = app.globalData.currentUser;
    console.log(this.user);
  },

  onShow: function () {
    var that = this;
    this.getMyAll();

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
    var limit = this.data.limit + 10
    this.setData({
      limit: limit
    })
    this.onShow()
  },

  //获取总的发布数
  getMyAll: function () {
    var that = this;
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);
    query.equalTo("userId", app.globalData.currentUser.id);
    query.count({
      success: function (count) {
        that.setData({
          totalCount: count,
        })
        console.log(count)
        
        if (that.data.totalCount > that.data.noticeList.length)
          that.getList();
      },
    });
  },

  getList: function () {
    var that = this;
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);
    query.equalTo("userId", app.globalData.currentUser.id);
    // query.include("publisher"); // 同时获取发布者信息 我的信息就行
    query.descending('createdAt');
    query.limit(that.data.limit);

    query.find({
      success: function (results) {
        console.log("My Post list :", results);
        that.dealWithData(results);

      },
      error: function (error) {
        console.log("查询失败： ", error.code + " " + error.message);
      }
    })
  },

  //处理数据
  dealWithData: function (results) {
    var that = this;
    var list = new Array();
    results.forEach(function (item) {
      var myId = item.get("publisher").objectId;
      var title = item.get("title");
      var description = item.get("description");
      var typeId = item.get("typeId");
      // var typeName = getTypeName(typeId); //根据类型id获取类型名称
      var price = item.get("price");
      var id = item.id;
      var createdAt = item.createdAt;
      var pastTime = util.pastTime(createdAt);
      var _url = null
      var pic = item.get("pic1");
      if (pic) {
        _url = pic._url;
      }

      var myName = that.user.get("nickName"); //item.get("publisher").nickName;
      var myPic = that.user.get("avatarUrl"); //item.get("publisher").avatarUrl;

      var jsonA;
      jsonA = {
        "title": title || '',
        "description": description || '',
        "typeId": typeId || '',
        // "typeName": typeName || '',
        "id": id || '',
        "publisherPic": myPic || '../images/avatar1.jpg',
        "publisherName": myName || '',
        "publisherId": myId || '',
        "pastTime": pastTime || '',
        "createdAt": createdAt || '',
        "pic": _url || '',
        "price": price || ''
      }
      list.push(jsonA);
    });

    setTimeout(function () {
      wx.hideLoading();
    }, 900);

    that.setData({
      noticeList: list
    })
    // that.onSetData(currentPageList, that.data.currentPage);
    console.log(that.data.noticeList)
  },

  // 新增记录
  toAddNotice: function () {
    wx.navigateTo({
      url: '../edit1/edit1',
    })
  },

  //跳转详情页
  showPostDetail: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var notice = that.data.noticeList[index];
    var data = JSON.stringify(notice);
    console.log(data)

    wx.navigateTo({
      url: '../postDetail/postDetail?isMyPost=true&data=' + data
    })
  }
})