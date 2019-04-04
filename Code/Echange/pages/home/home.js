var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    rollingImgList: [
      {
        imagePath: '/images/roll/1.jpg' ,
      },
      {
        imagePath: '/images/roll/2.jpg',
      },
      {
        imagePath: '/images/roll/3.jpg',
      }
    ],

    buttonClicked: false, //是否点击跳转

    windowHeight: 0,
    windowWidth: 0,

    noticeList: [],
    avatarList: [],
    limit: 10,
  },

  onShow: function () {
    var that = this;
    var currentUser = Bmob.User.current();//当前用户
    console.log(currentUser) //currentUsr里存储的是本程序账号

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

  //到地图模式
  openMap: function () {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      wx.navigateTo({
        url: '/pages/showinmap/showinmap',
      });
    }
  },

  pullUpLoad: function (e) {
    var that = this;
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

    query.descending('createdAt');
    query.limit(that.data.limit);
    query.find({
      success: function (results) {
        console.log(results);
        that.setData({
          noticeList: results
        })

        that.findAvatar();
      },
      error: function (error) {
        console.log("查询失败： ", error.code + " " + error.message);
      }
    })


  },

  findAvatar: function () {
    var that = this;
    var userIdList = [];
    this.data.noticeList.forEach(function (item) {
      var userId = item.attributes.userId;

      var flag = true;
      for (var i in userIdList) {
        if(userIdList[i].indexOf(userId) > -1) {
          flag = false;
          break;
        }
      }
      if (flag) {
        userIdList.push(userId);
      }
    });

    // console.log(userIdList)

    userIdList.forEach(function (userId) {
      var User = Bmob.Object.extend("_User");
      var query = new Bmob.Query(User);
      query.descending('createdAt');
      query.equalTo("objectId", userId.toString());
      // query.select("avatarUrl");
      query.find().then(res => {
        console.log(res[0].attributes.avatarUrl);
        var url = res[0].attributes.avatarUrl;
        that.data.avatarList.push({
          userId: userId.toString(),
          userName: res[0].attributes.userName,
          avatar: url
        })

        console.log(that.data.avatarList)

      })

    })
  },
  showPublisherAvatar: function () {

  }

})