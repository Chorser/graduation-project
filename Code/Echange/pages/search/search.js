//index.js
//获取应用实例
var WxSearch = require('../../wxSearch/wxSearch.js')
var common = require('../../utils/common.js')
var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
var app = getApp()
var that;
var allList;
Page({
  data: {
    buttonClicked: false, //是否点击跳转
    type: 0,
    noticeList: [],
    isEmpty: true,
    loading: false,

  },
  //选择要查询的活动类型
  choseType: function(e) {
    var type = e.currentTarget.id;
    if (type == 0) this.onShow();
    else if (type == 1) this.setData({
      noticeList: this.data.type1List
    });
    else if (type == 2) this.setData({
      noticeList: this.data.type2List
    });
    else if (type == 3) this.setData({
      noticeList: this.data.type3List
    });
    else if (type == 4) this.setData({
      noticeList: this.data.type4List
    });
    this.setData({
      type: type
    })
  },
  onLoad: function() {
    that = this;
    //初始化的时候渲染wxSearchdata
    WxSearch.init(that, 43, ['手机', '上自习', '开黑组队', '找驴友', '晚上去嗨', '约步走起']);
    WxSearch.initMindKeys(['一起', '上自习', '开黑组队', '找驴友', '晚上去嗨', '约步走起']);
  },

  onShow: function() {
    that.setData({
      loading: false
    });
    var molist = new Array();

    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);

    // 查询所有数据
    query.find({
      success: function(count) {
        query.descending("createdAt");
        query.include("publisher"); // 同时获取发布者信息
        query.find({
          success: function(results) {
            var list = that.dealWithData(results);
            var type1List = new Array(); //生活用品
            var type2List = new Array(); //学习用品
            var type3List = new Array(); //美妆服饰
            var type4List = new Array(); //电子产品

            for (var i in list) {
              if (list[i].typeId == 1) type1List.push(list[i]);
              else if (list[i].acttype == 2) gamelist.push(list[i]);
              else if (list[i].acttype == 3) friendlist.push(list[i]);
              else if (list[i].acttype == 4) travellist.push(list[i]);
            }
            that.setData({
              noticeList: list,
              type1List: type1List,
              type2List: type2List,
              type3List: type3List,
              type4List: type4List,
            })

            setTimeout(function() {
              wx.hideLoading();
            }, 900);

          },
        });
      },
    })
  },

  //js 实现模糊匹配查询
  findEach: function(e) {
    var that = this
    WxSearch.wxSearchAddHisKey(that);
    var strFind = that.data.wxSearchData.value;
    console.log("strFind=" + strFind);
    if (strFind == null || strFind == "") {
      wx.showToast({
        title: '输入为空',
        icon: 'loading',
      })
    }
    if (strFind != "") {
      WxSearch.updateHotMindKeys(that, strFind); //更新热门搜索和搜索记忆提示
      var nPos;
      var resultPost = [];
      for (var i in allList) {
        var sTxt = allList[i].title || ''; //活动的标题
        nPos = sTxt.indexOf(strFind);
        if (nPos >= 0) { //如果输入的关键字在该活动标题中出现过,则匹配该活动
          resultPost.push(allList[i]); //将该活动加入到搜索到的活动列表中
        }
      }
      that.setData({
        noticeList: resultPost
      })
    }
  },

  //处理数据,放入list
  dealWithData: function(results) {
    var that = this;
    var list = new Array();
    results.forEach(function(item) {
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
      var publisherPic = item.get("publisher").avatarUrl;

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
        "publisherPic": publisherPic || '../images/avatar1.jpg',
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
      list.push(jsonA);
    });

    return list;
  },

  // 点击活动进入活动详情页面
  // click_activity: function(e) {
  //   console.log(getCurrentPages())
  //   if (!this.buttonClicked) {
  //     util.buttonClicked(this);
  //     let actid = e.currentTarget.dataset.actid;
  //     let pubid = e.currentTarget.dataset.pubid;
  //     let user_key = wx.getStorageSync('user_key');
  //     wx.navigateTo({
  //       url: '/pages/detail/detail?actid=' + actid + "&pubid=" + pubid
  //     });
  //   }
  // },

  //跳转详情页
  showPostDetail: function (e) {
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


  wxSearchInput: function(e) {
    var that = this
    WxSearch.wxSearchInput(e, that);
  },
  wxSerchFocus: function(e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function(e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function(e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
  },
  wxSearchDeleteKey: function(e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function(e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function(e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  }
})

//根据活动类型获取活动类型名称
function getTypeName(type) {
  var typeName = "";
  if (type == 1) typeName = "	生活用品";
  else if (type == 2) typeName = "学习用品";
  else if (type == 3) typeName = "美妆服饰";
  else if (type == 4) typeName = "电子产品";
  return typeName;
}