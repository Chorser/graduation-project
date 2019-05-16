//index.js
//获取应用实例
var WxSearch = require('../../wxSearch/wxSearch.js')
var common = require('../../utils/common.js')
var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
var app = getApp()

// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var mapManager = new QQMapWX({
  key: 'OZQBZ-O7UKU-LW4VZ-43PF2-NVGZ7-H4FNU'
});

var that;
var allList;
Page({
  data: {
    navbarData: {
      showCapsule: true, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·商品搜索',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

    buttonClicked: false, //是否点击跳转
    typeId: 0, //选择的分类ID
    op: 0, //排序方式ID
    
    noticeList: [],
    isEmpty: true,
    loading: false,

    types: []
  },

  onLoad: function() {
    that = this;
    //初始化的时候渲染wxSearchdata
    WxSearch.init(that, 43, ['手机', '寝室神器', '教材']);
    WxSearch.initMindKeys(['手机', '寝室神器', '教材']);

    this.setData({
      types: app.globalData.typeList
    })
    console.log(this.data.types)

    wx.getLocation({
      success: function (res) {
        that.setData({
          mylatitude: res.latitude,
          mylongitude: res.longitude,
        });
      }
    })
  },

  //回到顶部
  goTop: function (e) {
    if (wx.pageScrollTo) {
      //   基础库 1.4.0 开始支持，低版本需做兼容处理
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，暂无法使用该功能，请升级后重试。'
      })
    }
  },
  
  //选择要查询的商品类型
  chooseType: function(e) {
    var typeId = e.currentTarget.id;
    if (typeId == 0)
      this.onShow();
    else if (typeId == 1)
      this.setData({
        noticeList: this.data.type1List
      });
    else if (typeId == 2)
      this.setData({
        noticeList: this.data.type2List
      });
    else if (typeId == 3)
      this.setData({
        noticeList: this.data.type3List
      });
    else if (typeId == 4)
      this.setData({
        noticeList: this.data.type4List
      });
    else if (typeId == 5)
      this.setData({
        noticeList: this.data.type5List
      });
    this.setData({
      typeId: typeId
    })
  },

  //排序方式，默认 离我最近 人气最高
  changeOrder: function(e) {
    var op = e.currentTarget.id;
    this.setData({
      op: op
    })
    if (op == 0) {
      this.setData({
        noticeList: this.data.noticeList.sort(sortBy('pastTime', false)),
      })
    }
    else if (op == 1) {
      // TODO 计算距离
      this.setData({
        noticeList: this.data.noticeList.sort(sortBy('distance', true)),
      })
    }

    else if (op == 2) {
      this.setData({
        noticeList: this.data.noticeList.sort(sortBy('likeCount', false)),
      })
    };
  },

  onShow: function() {
    that.setData({
      loading: true
    });

    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);

    // 根据类别查询所有数据
    query.descending("createdAt");
    query.include("publisher"); // 同时获取发布者信息
    query.find({
      success: function(results) {
        var list = that.dealWithData(results);
        // console.log(list);
        var type1List = new Array(); //生活用品
        var type2List = new Array(); //学习用品
        var type3List = new Array(); //美妆服饰
        var type4List = new Array(); //电子产品
        var type5List = new Array(); //二手书籍

        for (var i in list) {
          // console.log(list[i])
          if (list[i].typeId == 1) type1List.push(list[i]);
          else if (list[i].typeId == 2) type2List.push(list[i]);
          else if (list[i].typeId == 3) type3List.push(list[i]);
          else if (list[i].typeId == 4) type4List.push(list[i]);
          else if (list[i].typeId == 5) type5List.push(list[i]);
        }
        that.setData({
          noticeList: list,
          type1List: type1List,
          type2List: type2List,
          type3List: type3List,
          type4List: type4List,
          type5List: type5List,
        })

        allList = list;
        // setTimeout(function() {
        //   wx.hideLoading();
        // }, 900);
      },

    })

    that.setData({
      loading: false
    });
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
      for (var i in that.data.noticeList) {
        var sTxt = allList[i].title || ''; //发布的标题
        nPos = sTxt.indexOf(strFind);
        if (nPos >= 0) { //若关键字在该标题中出现过,则匹配该活动
          resultPost.push(allList[i]); //将该发布加入到搜索到的结果列表中
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
      console.log(item);
      var publisherId = item.get("publisher").objectId;
      var title = item.get("title");
      var description = item.get("description");
      var typeId = item.get("typeId");
      var typeName = getTypeName(typeId); //根据类型id获取类型名称
      var price = item.get("price");
      var address = item.get("address");
      var longitude = item.get("longitude");
      var latitude = item.get("latitude");

      // 距离计算
      // var distance = -1;
      // // var toAddress = { longitude: longitude, latitude: latitude};
      // if (longitude && latitude) {
      //   var toAddress = longitude + ',' + latitude;
      //   console.log(toAddress);
      //   distance =  that.calculateDistance(toAddress);
      // }
      // console.log(latitude , longitude)
      if (latitude == undefined || longitude == undefined) {
        var dis = 999999;
      } else {
        var dis = getDistance(that.data.mylatitude, that.data.mylongitude, longitude, latitude) / 1000000;
      }
      // console.log("distance:", dis);
      var tmp = dis.toString();
      var distance = tmp.substring(0, 6);

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

      var publisherPic = null;
      if (item.get("publisher").avatar) {
        publisherPic = item.get("publisher").avatar.url;
      }
      else {
        publisherPic = item.get("publisher").avatarUrl;
      }

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
        "distance": distance
      }
      list.push(jsonA);
    });

    return list;
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
        url: '../postDetail/postDetail?isMyPost=true&data=' + JSON.stringify(notice)
      })
    }
    else {
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
  },


  calculateDistance: function (dest) {
    var that = this;
    //调用距离计算接口
    mapManager.calculateDistance({
      //mode: 'walking', //可选值：'driving'、'walking' 'straight'（直线） ，不填默认：'walking'
      //获取表单提交的经纬度并设置from和to参数（示例为string格式）
      // from: data.start || '', //若起点有数据则采用起点坐标，若为空默认当前地址
      to: dest, //终点坐标
      success: function (res) {//成功后的回调
        console.log(res);
        var res = res.result;
        var dis = [];
        for (var i = 0; i < res.elements.length; i++) {
          var x = res.elements[i].distance;
          dis.push(res.elements[i].distance); //将返回数据存入dis数组，
        }
        // that.setData({ //设置并更新distance数据
        //   distance: dis
        // });
        return x;
      },
      fail: function (error) {
        console.error(error);
      // },
      // complete: function (res) {
      //   console.log(res);
      }
    });
  },

  // wxSearch 方法
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

//根据类型获取物品类型名称
function getTypeName(typeId) {
  var typeName = "";
  if (typeId == 1) typeName = "	生活用品";
  else if (typeId == 2) typeName = "学习用品";
  else if (typeId == 3) typeName = "美妆服饰";
  else if (typeId == 4) typeName = "电子产品";
  return typeName;
}

// 计算两点位置距离（直线距离）
function getDistance(lat1, lng1, lat2, lng2) {
  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;

  var rad1 = lat1 * Math.PI / 180.0;
  var rad2 = lat2 * Math.PI / 180.0;
  var a = rad1 - rad2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var r = 6378137; //地球半径
  var distance = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));

  return distance;
}

/**数组根据数组对象中的某个属性值进行排序的方法 
     * 使用例子：newArray.sort(sortBy('number',false)) //表示根据number属性降序排列;若第二个参数不传递，默认表示升序排序
     * @param attr 排序的属性 如number属性
     * @param rev true表示升序排列，false降序排序
  * */
function sortBy(attr, rev) {
  // 第一个参数表示按什么属性值排序
  //第二个参数没有传递 默认升序排列
  if (rev == undefined) {
    rev = 1;
  } else {
    rev = (rev) ? 1 : -1;
  }

  return function (a, b) {
    a = a[attr];
    b = b[attr];
    if (a < b) {
      return rev * -1;
    }
    if (a > b) {
      return rev * 1;
    }
    return 0;
  }
};