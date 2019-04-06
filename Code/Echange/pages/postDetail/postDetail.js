Page({
  data: {
    noPic: false, //是否显示图片
    indicatorDots: true, // 是否显示小点

    picList: [],
    notice: null
  },

  onLoad: function (options) {
    var noPict, showDots = false;
    var data = JSON.parse(options.data)
    // console.log(data)

    if (!data.pic || data.pic == '') {
      noPict = true;
    }
    else {
      var list = [data.pic];

      if (list.length > 1) 
        showDots = true;
    }

    this.setData({
      notice: data,
      picList: list || [],
      noPic: noPict,
      indicatorDots: showDots,
    })
    
    console.log(this.data.notice)
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