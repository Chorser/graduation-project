var Bmob = require('../../utils/Bmob-1.6.7.min.js');
var app = getApp()

Page({

  data: {
    avatar: '',
    nickName: ''
  },

  onLoad: function (options) {
    this.setData({
      avatar: wx.getStorageSync('avatar') ||'https://yunlaiwu0.cn-bj.ufileos.com/teacher_avatar.png',
      name: wx.getStorageSync('name') || '用户A'
    });

    Bmob.User.login('username', 'password').then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    });
    console.log(Bmob);
  },

  navTo: function (e) {
    var target = e.currentTarget.dataset.target;
    var _url = '/pages/' + target + '/' + target;
    wx.navigateTo({
      url: _url
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})