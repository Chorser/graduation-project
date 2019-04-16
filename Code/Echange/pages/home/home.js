var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
// 搜索模块
// var WxSearch = require('../../utils/wxSearch/wxSearch.js')

const app = getApp()

Page({
  data: {
    navbarData: {
      isHomePage: true,
      showCapsule: false, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·易换集市',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

    currentIndex: 0,
    rollingImgList: ['/images/roll/1.jpg', '/images/roll/2.jpg','/images/roll/3.jpg', '/images/roll/4.jpg'],

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

    addressName: null,
    address: '',
  },

  onLoad: function (options) {
    var that = this;
    
    if (options.address) {
      this.setData({
        addressName: options.addressname,
        address: options.address
      })
    }

    wx.getSystemInfo({
      success: (res) => {
        console.log(res)
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      },
    })

    if (!app.globalData.currentUser) {
      app.globalData.currentUser = Bmob.User.current();
    }
    // console.log(this.data.addressName)

    // 自动定位学校


  },

  onShow: function () {
    this.getAll(); // 获取页数
    this.getList();
  },

  handleChange: function (e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },

  //打开地图
  openMap: function () {
    var that = this;
    // if (!this.buttonClicked) {
    //   util.buttonClicked(this);
    //   wx.navigateTo({
    //     url: '/pages/showinmap/showinmap',
    //   });
    // }

    //选择地点
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        console.log(res.name);
        that.setData({
          addressName: res.name,
          address: res.address
        })
        //选择地点之后返回到原来页面
        // wx.navigateTo({
        //   url: "/pages/home/home?addressname=" + res.name + "address=" + res.address
        // });
        
      },
      fail: function (err) {
        console.log(err)
      }
    });
  },

  toSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search',
    });
  },
  //模糊查询 title
  // searchInput: function (e) {
  //   var searchStr = e.detail.value;
  //   console.log(searchStr)
  //   var that = this;
  //   var Notice = Bmob.Object.extend("Published_notice");
  //   var query = new Bmob.Query(Notice);
  //   query.descending("createdAt");
  //   query.include("publisher"); // 同时获取发布者信息
    
  //   query.find({
  //     success: function (results) {
  //       var result = that.dealWithData(results);

  //       var i; 
  //       var list = []; 
  //       for (i = 0; i < result.length; i++) {
  //         if (result[i].title.indexOf(searchStr) >= 0) {
  //           // console.log("成功");// console.log(result[i]);
  //           list.push(result[i]);
  //         }
  //       }
  //       that.setData({
  //         noticeList: list
  //       })
  //     },
  //     error: function (error) {
  //       console.log("查询失败： ", error.code + " " + error.message);
  //     }
  //   })
  // },

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
        var currentPageList = that.dealWithData(results);

        that.onSetData(currentPageList, that.data.currentPage);

        setTimeout(function () {
          wx.hideLoading();
        }, 900);
      },
      error: function (error) {
        console.log("查询失败： ", error.code + " " + error.message);
      }
    })
  },

  //处理数据,放入list
  dealWithData: function (results) {
    var that = this;
    var currentPageList = new Array();
    results.forEach(function (item) {
      console.log(item)
      var publisherId = item.get("publisher").objectId;
      var title = item.get("title");
      var description = item.get("description");
      var typeId = item.get("typeId");
      var typeName = getTypeName(typeId); //根据类型id获取类型名称
      var price = item.get("price");
      var address = item.get("address");
      var longitude = item.get("longitude");
      var latitude = item.get("latitude");

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
      var publisherName = item.get("publisher").nickName;
      if (item.get("publisher").avatar)
        var publisherPic = item.get("publisher").avatar.url;
      // console.log(publisherPic)

      var viewCount = item.get("viewCount") || 0;
      var likeCount = item.get("likeCount") || 0;
      var liker = item.get("liker"); //收藏用户ID数组
      // console.log(liker)
      var isLiked = false;
      if (liker) {
        liker.forEach(function(item) {
          if (item == app.globalData.currentUser.id) {
            isLiked = true;
          }
        })
      }
      // console.log(isLiked)

      var jsonA;
      jsonA = {
        "title": title || '',
        "description": description || '',
        "typeId": typeId || '',
        "typeName": typeName || '',
        "id": id || '',
        "publisherPic": publisherPic || '../../images/avatar1.jpg',
        "publisherName": publisherName || '',
        "publisherId": publisherId || '',
        "pastTime": pastTime || '',
        "pic": _url || '',
        "price": price || '',
        // "commentnum": commentnum,
        "isLiked": isLiked, //是否被本用户收藏
        "viewCount": viewCount,
        "likeCount": likeCount,
        // "liker": liker,

        "address": address,
        "latitude": latitude,
        "longitude": longitude,
      }
      currentPageList.push(jsonA);
    });

    return currentPageList;
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
    }, 500);
    
  },

  //跳转详情页
  showPostDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var notice = this.data.noticeList[index];
    var data = JSON.stringify(notice);
    console.log(data);

    //是自己发布的特殊处理
    if (notice.publisherId == app.globalData.currentUser.id) {
      wx.navigateTo({
        url: '../postDetail/postDetail?isMyPost=true&data=' + data
      })
    }
    else {
      this.addViewCount(notice.id);
      notice.viewCount++;
      wx.navigateTo({
        url: '../postDetail/postDetail?data=' + data
      })
    }
  },

  // 更新数据库 浏览数
  addViewCount: function (objectId, cnt) {
    var that = this;
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);
    query.get(objectId).then(res => {
      var cnt = res.get('viewCount') || 0;
      
      res.save()
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