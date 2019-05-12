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
    unread: 0,

    delBtnWidth: 160,

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getList();
  },

  // 列表实现左滑删除
  drawStart: function (e) {
    // console.log("drawStart", e.touches);  
    var touch = e.touches[0]

    for (var index in this.data.messageList) {
      var item = this.data.messageList[index]
      item.right = 0
    }
    this.setData({
      messageList: this.data.messageList,
      startX: touch.clientX
    })

  },
  drawMove: function (e) {
    var touch = e.touches[0]
    var item = this.data.messageList[e.currentTarget.dataset.index]
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        isScroll: false,
        messageList: this.data.messageList
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        messageList: this.data.messageList
      })
    }
  },
  drawEnd: function (e) {
    var item = this.data.messageList[e.currentTarget.dataset.index]
    // 距离超过一半就显示按钮
    if (item.right >= this.data.delBtnWidth / 2) {   
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        messageList: this.data.messageList,
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        messageList: this.data.messageList,
      })
    }
  },

  deleteItem: function (e) {
    var that = this;
    // 软删除
    console.log(e.currentTarget.dataset.index);
    var item = this.data.messageList[e.currentTarget.dataset.index]
    // console.log(item.id)
    var Message = Bmob.Object.extend("Message");
    var messageQuery = new Bmob.Query(Message);
    messageQuery.get(item.id).then(res => {
      // console.log(res);
      res.set('is_delete', true);
      res.save(null, {
        success: function (res) {
          wx.showToast({
            title: '删除成功',
            duration: 1200
          });

          that.getList();
        },
        fail: function (err) {
          console.log(err);
        }
      });
    })
  },


  getList: function () {
    var that = this;
    var Message = Bmob.Object.extend("Message");
    var messageQuery = new Bmob.Query(Message);
    messageQuery.equalTo("fid", app.globalData.currentUser.id);
    messageQuery.equalTo("is_delete", false);
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
    var unreadCnt = 0;
    results.forEach(function (item) {
      // console.log(item)
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
      if (isRead == false) unreadCnt++;
       
      // var _url = null
      // var ava = item.get("avatar");
      // if (ava) {
      //   _url = pic._url;
      // }
      var jsonA;
      jsonA = {
        "id": item.id,
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

    that.setData({ 
      messageList: list,
      unread: unreadCnt
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
        var objectId = that.data.messageList[index].id;
        var Message = Bmob.Object.extend("Message");
        var query = new Bmob.Query(Message);
        query.get(objectId).then(res => {
          console.log(res);
          res.set('is_read', true);
          res.save(null, {
            success: function (res) {
              wx.showToast({
                title: '标记为已读',
                duration: 1200
              });

              var unreadcnt = --that.data.unread;
              that.setData({
                [ifread]: true,
                unread: unreadcnt,
              })
            },
            fail: function (err) {
              console.log(err);
            }
          });
        })
      }

      that.setData({
        [now]: false,
      })

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
  else if (type == 2) typeName = "取消收藏";//? 取消收藏 就删除收藏消息
  else if (type == 3) typeName = "评论";
  else if (type == 4) typeName = "回复";
  else if (type == 5) typeName = "购买";
  return typeName;
}