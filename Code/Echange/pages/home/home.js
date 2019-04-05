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

    query.limit(that.data.limit);
    query.descending('createdAt');
    query.include("publisher");
    query.find({
      success: function (results) {
        console.log(results);
        that.dealWithData(results);

        that.setData({
          noticeList: results
        })

      },
      error: function (error) {
        console.log("查询失败： ", error.code + " " + error.message);
      }
    })
  },


  //处理数据
  dealWithData: function (results) {
    var that = this;
    results.forEach(function (item) {
      console.log(item.get("publisher"))
      var publisherId = item.get("publisher").objectId;
      var title = item.get("title");
      var description = item.get("description");
      var typeId = item.get("typeId");
      var typeName = getTypeName(typeId); //根据类型id获取类型名称
      // var endtime = item.get("endtime");
      // var address = item.get("address");
      // var isShow = item.get("isShow");
      // var peoplenum = item.get("peoplenum");
      // var likenum = item.get("likenum");
      // var liker = item.get("liker");
      // var isLike = 0;
      // var commentnum = item.get("commentnum");
      var id = item.id;
      var createdAt = item.createdAt;
      var pastTime = util.pastTime(createdAt);
      var _url
      var pic = item.get("pic1");
      if (pic) {
        _url = item.get("pic1")._url;
      } else {
        _url = "http://bmob-cdn-14867.b0.upaiyun.com/2017/12/01/89a6eba340008dce801381c4550787e4.png";
      }
      var publisherName = item.get("publisher").nickName;
      var publisherPic = item.get("publisher").avatarUrl;

      var jsonA;
      jsonA = {
        "title": title || '',
        "description": description || '',
        "typeId": typeId || '',
        "typeName": typeName || '',
        // "isShow": isShow,
        // "endtime": endtime || '',
        // "address": address || '',
        // "peoplenum": peoplenum || '',
        "id": id || '',
        "publisherPic": publisherPic || '',
        "publisherName": publisherName || '',
        "publisherId": publisherId || '',
        "pastTime": pastTime || '',
        "pic": _url || '',
        // "likenum": likenum,
        // "commentnum": commentnum,
        // "is_liked": isLike || ''
      }
    })
  },

})

function getTypeName(type) {
  var typeName = "";
  if (type == 1) typeName = "	生活用品";
  else if (type == 2) typeName = "学习用品";
  else if (type == 3) typeName = "美妆服饰";
  else if (type == 4) typeName = "电子产品";
  return typeName;
}