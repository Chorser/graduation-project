const app = getApp();
var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');

Page({
  
  data: {
    navbarData: {
      showCapsule: false, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·我的消息',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

    messageList: [],
    totalCount: 0,
    limit: 10,
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getList();
  },

  getList: function () {
    var that = this;
    var Message = Bmob.Object.extend("Message");
    var messageQuery = new Bmob.Query(Message);
    messageQuery.equalTo("fid", app.globalData.currentUser.id);
    messageQuery.descending('updatedAt');
    // messageQuery.limit(that.data.limit);

    messageQuery.find({
      success: function (results) {
        console.log("My Message list :", results);
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
      console.log(item)
      var publisherId = item.get("fid");
      var noticeId = item.get("wid");
      var noticeTitle = item.get("wTitle");
      var user = item.get("user"); //做出操作的用户
      var userName = item.get("userName");
      var userAvatar = item.get("avatarUrl");
      var typeId = item.get("msgType");
      var typeName = getTypeName(typeId); //根据类型id获取消息类型名称
      var isRead = item.get("is_read"); 
      var pastTime = util.pastTime(item.updatedAt);
      // var _url = null
      // var ava = item.get("avatar");
      // if (ava) {
      //   _url = pic._url;
      // }
      var jsonA;
      jsonA = {
        "publisherId": publisherId || '',
        "noticeId": noticeId || '',
        "noticeTitle": noticeTitle || '',
        "typeName": typeName || '',
        "userName": userName || '',
        "userAvatar": userAvatar || '',
        "isRead": isRead,
        "pastTime": pastTime || '',
        "hidden": true
      }
      list.push(jsonA);
    });

    setTimeout(function () {
      wx.hideLoading();
    }, 500);

    that.setData({
      messageList: list
    })
  },

  showFold: function (options) {
    var that = this;
    var index = options.currentTarget.dataset.index;
    var now = "messageList[" + index + "].hidden";
    var ifread = "messageList[" + index + "].isRead";
    if (that.data.messageList[index].hidden == true) {
      console.log("展开");
      if (!that.data.messageList[index].isRead) {
        wx.showToast({
          title: '标记已读',
          duration: 1500
        })
      }
      that.setData({
        [now]: false,
        [ifread]: true,
      })
      
      //TODO 数据库操作
    } else {
      console.log("折叠");
      that.setData({
        [now]: true,
      })
    }
  }

})

// message type
function getTypeName(type) {
  var typeName = "";
  if (type == 1) typeName = "	收藏 ";
  else if (type == 2) typeName = "取消收藏";//?取消收藏 就删除收藏消息
  else if (type == 3) typeName = "评论";
  else if (type == 4) typeName = "回复";
  else if (type == 5) typeName = "购买";
  return typeName;
  // var list = app.globalData.typeList;
  // return list[type];
}