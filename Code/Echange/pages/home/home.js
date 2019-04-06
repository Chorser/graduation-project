var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    currentIndex: 0,
    rollingImgList: ['/images/roll/1.jpg', '/images/roll/2.jpg','/images/roll/3.jpg'],

    buttonClicked: false, //是否点击跳转

    windowHeight: 0,
    windowWidth: 0,

    noticeList: [],

    //分页加载
    currentPage: 0, //当前页
    isLastPage: false, // 标记是否是最后一页
    limitPage: 5,//每页显示几条信息
    lastPageNum: 0, //最后一页显示的信息数量
    totalPage: 0, //发布的信息总页数
  },

  onShow: function () {
    var that = this;
    // var currentUser = Bmob.User.current();//当前用户
    // console.log(currentUser);

    this.getAll(); // 获取页数

    // if (this.data.noticeList.length == 0)
    this.getList();

    wx.getSystemInfo({
      success: (res) => {
        console.log(res)
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      },
    })

  },

  handleChange: function (e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },

  //进入地图
  openMap: function () {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      wx.navigateTo({
        url: '/pages/showinmap/showinmap',
      });
    }
  },

  //获取总的发布数
  getAll: function () {
    var that = this;
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);

    query.count({
      success: function (count) {
        var totalPage = 0;
        var lastPageNum = 0;
        if (count % that.data.limitPage == 0) { 
          totalPage = parseInt(count / that.data.limitPage);
        } else {
          var lowPage = parseInt(count / that.data.limitPage);
          lastPageNum = count - (lowPage * that.data.limitPage);
          totalPage = lowPage + 1;
        }
        that.setData({
          // totalCount: count,
          lastPageNum: lastPageNum,
          totalPage: totalPage
        })
        console.log("共有" + count + " 条记录");
        console.log("共有" + totalPage + "页");
        console.log("最后一页加载" + lastPageNum + "条");
      },
    });
  },

  //数据存储
  onSetData: function (data) {
    console.log(data.length);
    let page = this.data.currentPage + 1;
    //设置数据
    data = data || [];
    this.setData({
      noticeList: page === 1 || page === undefined ? data : this.data.noticeList.concat(data),
    });
    console.log(this.data.noticeList, page);
  },

  getList: function () {
    var that = this;
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);

    query.limit(that.data.limitPage);
    query.skip(that.data.currentPage * that.data.limitPage); //跳过已加载的数据
    query.descending("createdAt");
    query.include("publisher"); // 同时获取发布者信息
    query.find({
      success: function (results) {
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
    var currentPageList = new Array();
    results.forEach(function (item) {
      // console.log(item.get("publisher"))
      var publisherId = item.get("publisher").objectId;
      var title = item.get("title");
      var description = item.get("description");
      var typeId = item.get("typeId");
      var typeName = getTypeName(typeId); //根据类型id获取类型名称
      var price = item.get("price");
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
      var _url = null
      var pic = item.get("pic1");
      if (pic) {
        _url = pic._url;
      }
       else {
        // _url = "http://bmob-cdn-14867.b0.upaiyun.com/2017/12/01/89a6eba340008dce801381c4550787e4.png";
      }
      var publisherName = item.get("publisher").nickName;
      var publisherPic = item.get("publisher").avatarUrl;
    
      var jsonA;
      jsonA = {
        "title": title || '',
        "description": description || '',
        "typeId": typeId || '',
        "typeName": typeName || '',
        "id": id || '',
        "publisherPic": publisherPic || '../images/avatar1.jpg',
        "publisherName": publisherName || '',
        "publisherId": publisherId || '',
        "pastTime": pastTime || '',
        "pic": _url || '',
        "price": price || ''
        // "isShow": isShow,
        // "endtime": endtime || '',
        // "address": address || '',
        // "peoplenum": peoplenum || '',
        // "likenum": likenum,
        // "commentnum": commentnum,
        // "is_liked": isLike || ''
      }
      currentPageList.push(jsonA);
    });

    that.onSetData(currentPageList, that.data.currentPage);

    setTimeout(function () {
      wx.hideLoading();
    }, 900);

    // that.setData({
    //   noticeList: allList
    // })
    // console.log(that.data.noticeList);
  },

  // 加载更多数据
  loadMore: function () {
    var that = this;
    if (that.data.isLastPage) {
      return;
    }
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    setTimeout(function () {
      wx.hideLoading();
    }, 1000);
    that.setData({
      currentPage: that.data.currentPage + 1
    });
    //判断是不是最后一页
    if (that.data.currentPage + 1 >= that.data.totalPage) {
      that.setData({
        isLastPage: true
      })
      if (that.data.lastPageNum != 0) {
        that.setData({
          limitPage: that.data.lastPageNum,
        })
      }
      this.getList();
    } else {
      this.getList();
    }
  },

  onPullDownRefresh: function () {
    this.refresh();
  },

  refresh: function () {
    this.setData({
      noticeList: [], 
      currentPage: 0,
      isLastPage: false,
      limitPage: 5,
      // totalCount: 0,
      lastPageNum: 0,
      totalPage: 0
    })
    this.onShow();

    setTimeout(function () {
      wx.stopPullDownRefresh(); //处理完终止下拉刷新
    }, 300);
    
  },

  //跳转详情页
  showPostDetail: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var notice = that.data.noticeList[index];
    var data = JSON.stringify(notice);
    console.log(data)

    wx.navigateTo({
      url: '../postDetail/postDetail?data=' + data
    })
  }
})

function getTypeName(type) {
  var typeName = "";
  if (type == 1) typeName = "	生活用品";
  else if (type == 2) typeName = "学习用品";
  else if (type == 3) typeName = "美妆服饰";
  else if (type == 4) typeName = "电子产品";
  return typeName;
}