// pages/postDetail/postDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noPic: false, //是否显示图片
    indicatorDots: true, // 是否显示小点

    picList: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(options.data)
    console.log(data)
    if (!data.pic || data.pic == '') {
      var noPict = true;
    }
    else {
      var list = [data.pic];

      if (list.length == 1) 
        var showDots = false;

      this.setData({
        picList: list,
        noPic: noPict,
        indicatorDots: showDots
      })
    }
    console.log(this.data.picList)
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

  },

  previewImg: function (e) {
    var imgList = e.currentTarget.dataset.list;//获取data-list
    var src = e.currentTarget.dataset.src;//获取data-src

    //预览图片，可左右划动
    wx.previewImage({
      urls: imgList,
      current: src
    })
  }
})