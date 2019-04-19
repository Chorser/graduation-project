var Bmob = require('utils/bmob.js');
Bmob.initialize(
  "9a68cce6689ca69dcd286c4e4eba7d07", "a5e489144f78cfd52d57e71375bda36d");

App({
  globalData: {
    userInfo: null,
    currentUser: null,
    typeList: [],

    share: false, //标记分享
    height: 0,
  },
  
  onLaunch: function (options) {
    var that = this;

    // 判断是否由分享进入小程序
    // if (options.scene == 1007 || options.scene == 1008) {
    //   this.globalData.share = true
    // } else { 
    //   this.globalData.share = false
    // };

    this.globalData.currentUser = Bmob.User.current();
    console.log(this.globalData.currentUser)

    //调用系统API获取设备的信息
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.height = res.statusBarHeight;
        console.log(res.statusBarHeight)

        var kScreenW = res.windowWidth / 375
        var kScreenH = res.windowHeight / 603
        wx.setStorageSync('kScreenW', kScreenW)
        wx.setStorageSync('kScreenH', kScreenH)
      }
    })

    // 获取物品类别
    var Type = Bmob.Object.extend("Product_type");
    var query = new Bmob.Query(Type);
    query.select("typeId");
    query.select("typeName");
    query.find({
      success: function (results) {
        // console.log(results);
        var list = [];
        for (let i = 0; i < results.length; i++) {
          // console.log(results[i].get("typeId"), results[i].get("typeName"));
          list[results[i].get("typeId")] = results[i].get("typeName");
        }
        console.log(list)
        that.globalData.typeList = list;

      },
      fail: function (error) {

      }
    })
  }
})