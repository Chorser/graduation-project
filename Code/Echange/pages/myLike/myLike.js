var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
var app = getApp();

Page({

  data: {
    navbarData: {
      showCapsule: true, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·我的收藏',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

    windowHeight: 0,
    windowWidth: 0,

    likeList: [],
    totalCount: 0
  },

  onShow: function(options) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    var Like = Bmob.Object.extend("Likes");
    var query = new Bmob.Query(Like);
    var userId = app.globalData.currentUser.id;
    query.equalTo("user", userId);
    query.descending("createAt");
    query.include("notice");
    query.find({
      success: function(res) {
        var list = [];
        for (let i = 0; i < res.length; i++) {
          var item = res[i].get("notice");
          // console.log(item)
          if (item.pic1)
            item.pic = item.pic1.url || '';

          item.price = item.price || 0;
          item.pastTime = util.pastTime(item.createdAt);
          item.viewCount = item.viewCount || 0;
          item.likeCount = item.likeCount || 0;

          var isLiked = true;
          // if (item.liker) {
          //   item.liker.forEach(function(i) {
          //     if (i == app.globalData.currentUser.id) {
          //       isLiked = true;
          //     }
          //   })
          // }
          item.isLiked = isLiked;

          var publisherId = item.publisher.objectId;
          var User = Bmob.Object.extend('_User')
          var query = new Bmob.Query(User);
          query.get(publisherId, {
            success: function(result) {
              item.publisherName = result.get("nickName");
              if (result.get("avatar")) {
                item.publisherPic = result.get("avatar")._url;
              }
            },
          })
          list.push(item);
          console.log(item);
        }
        setTimeout(function () {
          that.setData({
            likeList: list,
            totalCount: list.length
          })
          wx.hideLoading();
        }, 1000);
      },
      fail: function(res) {
        console.log(res)
      }
    })

  },

  //跳转详情页
  showPostDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var notice = this.data.likeList[index];

    //是自己发布的特殊处理
    if (notice.publisher.objectId == app.globalData.currentUser.id) {
      wx.navigateTo({
        url: '../postDetail/postDetail?isMyPost=true&data=' + JSON.stringify(notice)
      })
    } else {
      notice.viewCount++;
      wx.navigateTo({
        url: '../postDetail/postDetail?data=' + JSON.stringify(notice)
      })
      this.addViewCount(notice.id);
    }
  },

  // 更新数据库 浏览数
  addViewCount: function (objectId) {
    var that = this;
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);
    query.get(objectId).then(res => {
      var cnt = res.get('viewCount') || 0;
      res.set('viewCount', ++cnt)
      res.save();
    })
  }

})