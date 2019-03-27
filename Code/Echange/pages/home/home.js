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

  },

  onShow: function () {
    var currentUser = Bmob.User.current();//当前用户
    console.log(currentUser) //currentUsr里存储的是本程序账号
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

})