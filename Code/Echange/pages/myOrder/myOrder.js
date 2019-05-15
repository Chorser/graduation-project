var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      showCapsule: true, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·我的订单',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

    selected: true,
    selected1: false,
    orderList: [],
    buyList: [],
    sellList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var Order = Bmob.Object.extend("Order");

    var userId = app.globalData.currentUser.id;
    var isme = new Bmob.User();
    isme.id = userId;
    // 我买到的
    var orderQuery = new Bmob.Query("Order");
    orderQuery.equalTo("buyer", isme);
    orderQuery.include("notice");
    orderQuery.descending('createdAt');
    orderQuery.find({
      success: function (results) {
        console.log("buy Order list :", results);
        that.dealWithData(results, 1);
      },
      error: function (error) {
        console.log("查询失败： ", error.code + " " + error.message);
      }
    })
    // 我卖出的
    var orderQuery2 = new Bmob.Query("Order");
    orderQuery.equalTo("seller", isme);
    orderQuery.include("notice");
    orderQuery.descending('createdAt');
    orderQuery.find({
      success: function (results2) {
        console.log("sell Order list :", results2);
        that.dealWithData(results2, 2);
      },
      error: function (error) {
        console.log("查询失败： ", error.code + " " + error.message);
      }
    })
  },

  //处理数据
  dealWithData: function (results, flag) {
    var that = this;
    var list = new Array();
    results.forEach(function (item) {
      console.log(item)
      var orderId = item.id;
      var wTitle = item.get("notice").title;
      var price = item.get("notice").price;

      var _url = null;
      var pic = item.get("notice").pic1;
      if (pic) {
        _url = pic.url;
      }

      var jsonA;
      jsonA = {
        "orderId": orderId,
        "title": wTitle || '',
        "pic1": _url,
        "price": price,
      }
      list.push(jsonA);
    });

    console.log(list)
    if (flag == 1) {
      that.setData({
        buyList: list,
        orderList: list
      })
    } else {
      that.setData({
        sellList: list,
      })
    }
  },

  selected: function () {
    //并更改list
    this.setData({
      selected: true,
      selected1: false,
      orderList: this.data.buyList
    });
  },

  selected1: function () {
    //并更改list
    this.setData({
      selected: false,
      selected1: true,
      orderList: this.data.sellList
    })
  }
})