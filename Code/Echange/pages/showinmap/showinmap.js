var common = require('../../utils/common.js')
var Bmob = require("../../utils/bmob.js");
var app = getApp()

// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var mapManager = new QQMapWX({
  key: 'OZQBZ-O7UKU-LW4VZ-43PF2-NVGZ7-H4FNU'
});

Page({
  data: {
    //地图的宽高
    mapHeight: '95%',
    mapWidth: '95%',
    mapTop: '0',  
    //用户当前位置
    point: {
      latitude: 0,
      longitude: 0,
      address: "" //选择的位置
    },
    //当前地图的缩放级别
    mapScale: 15,
    //活动标记物
    markers: [],
    //地图上不可移动的控件
    controls: [{ //定位当前位置
        id: 1,
        position: {
          left: 10 * wx.getStorageSync("kScreenW"),
          top: 523 * wx.getStorageSync("kScreenH"),
          width: 40 * wx.getStorageSync("kScreenW"),
          height: 40 * wx.getStorageSync("kScreenW")
        },
        iconPath: '/images/location2.png',
        clickable: true,
      },
      { //地图中心位置按钮
        id: 2,
        position: {
          left: 177.5 * wx.getStorageSync("kScreenW"),
          top: 261.5 * wx.getStorageSync("kScreenH"),
          width: 32 * wx.getStorageSync("kScreenW"),
          height: 32 * wx.getStorageSync("kScreenW")
        },
        iconPath: '/images/now2.png',
        clickable: false,
      }
    ],
  },

  //点击定位到当前位置
  controltap(e) {
    var that = this
    console.log(e.controlId)
    that.getUserCurrentLocation()
  },
  //定位到用户当前位置
  getUserCurrentLocation: function() {
    this.mapCtx.moveToLocation();
    this.setData({
      'mapScale': 15
    })
  },
  //位置变化的时候
  regionchange: function(e) {
    //得到地图中心点的位置
    var that = this;
    that.mapCtx.getCenterLocation({
      success: function(res) {
        //经纬度保留6位小数
        var longitudeFix = res.longitude.toFixed(6)
        var latitudeFix = res.latitude.toFixed(6)
        if (e.type == "begin") {
          console.log('位置相同,不执行刷新操作')
        } else {
          console.log("位置变化了")
        }
      }
    })
  },

  //页面加载的函数
  onLoad() {
    var that = this;

    wx.chooseLocation({
      success: function (res) {
        console.log(res.name);
        //选择地点之后返回到原来页面
        wx.navigateTo({
          url: "/pages/home/home?address=" + res.name
        });
      },
      fail: function (err) {
        console.log(err)
      }
    });

    //获取当前位置
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用wx.openLocation 的坐标
      success: function(res) {
        // success
        var latitude = res.latitude
        var longitude = res.longitude
        var point = {
          latitude: latitude,
          longitude: longitude
        };
        that.setData({
          point: point,
        })
      }
    })
  },

  // onShow: function() {
  //   var that = this;
  //   var molist = new Array();
  //   var Notice = Bmob.Object.extend("Published_notice");
  //   var query = new Bmob.Query(Notice);
  //   query.include("publisher");
  //   // 查询所有数据
  //   query.find({
  //     success: function(results) {
  //       for (var i = 0; i < results.length; i++) {
  //         var id = results[i].id;
  //         var publisherId = results[i].get("publisher").objectId;
  //         var title = results[i].get("title");
  //         if (title.length > 5) {
  //           title = title.substring(0, 5) + "...";
  //         }
  //         var acttype = results[i].get("acttype");
  //         var actcolor = that.getbgColor(acttype);
  //         var isShow = results[i].get("isShow");
  //         var address = results[i].get("address");
  //         var longitude = results[i].get("longitude");
  //         var latitude = results[i].get("latitude");
  //         var acttypename = results[i].get("acttypename");
  //         var jsonA;
  //         jsonA = {
  //           "id": id || '',
  //           "title": title || '',
  //           "pubid": publisherId || '',
  //           "acttype": acttype || '',
  //           "isShow": isShow,
  //           "actcolor": actcolor || '',
  //           "acttypename": acttypename || '',
  //           "latitude": latitude || '',
  //           "longitude": longitude || '',
  //         }
  //         molist.push(jsonA);
  //         that.setData({
  //           moodList: molist,
  //           markers: that.getSchoolMarkers(molist)
  //         })
  //       }
  //     },
  //     error: function(error) {
  //       // common.dataLoading(error, "loading");
  //       console.log(error)
  //     }
  //   });
  // },

  //通过活动类型返回地图气泡背景色
  getbgColor: function(acttype) {
    if (acttype == 1) return "#FE6C01";
    else if (acttype == 2) return "#00cdab";
    else if (acttype == 3) return "#0E53A6";
    else if (acttype == 4) return "#1DD201";
    else if (acttype == 5) return "#FEC401";
    else if (acttype == 6) return "#FE0701";
    else if (acttype == 7) return "#0C5DA5";
    else if (acttype == 8) return "#E20149";
    else if (acttype == 9) return "#A54A00";
  },

  onReady: function(e) {
    // 使用 wx.createMapContext 获取 map 上下文 
    this.mapCtx = wx.createMapContext('myMap')
  },

  getSchoolMarkers(molist) {
    let markers = [];
    for (let item of molist) {
      let marker = this.createMarker(item);
      markers.push(marker)
    }
    return markers;
  },

  createMarker(point) {
    let marker = {
      iconPath: "/static/images/map4.png",
      id: point.id || 0,
      name: point.name || '',
      latitude: point.latitude,
      longitude: point.longitude,
      width: 25,
      height: 25,
      callout: {
        content: point.title,
        color: 'white',
        fontSize: 10,
        borderRadius: 50,
        bgColor: point.actcolor,
        padding: 5,
        display: "ALWAYS"
      },
    };
    return marker;
  }
})