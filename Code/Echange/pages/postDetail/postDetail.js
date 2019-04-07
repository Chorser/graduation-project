var Bmob = require('../../utils/bmob.js');
const app = getApp()

Page({
  data: {
    noPic: false, //是否显示图片
    indicatorDots: true, // 是否显示小点

    picList: [],
    notice: null,

    isMyPost: false,
    isLiked: false,
  },

  onLoad: function (options) {
    if (options.isMyPost) {
      //用户查看自己的发布商品详情 特殊处理
      this.setData({
        isMyPost: true,
        modifyData: options.data
      })
    }

    var noPict = false, showDots = false;
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
      
      isLiked: data.isLiked
    })
    
    console.log(this.data.notice)
  },

  //预览图片,多图可左右滑动
  previewImg: function (e) {
    var imgList = e.currentTarget.dataset.list;//获取data-list
    var src = e.currentTarget.dataset.src;//获取data-src

    wx.previewImage({
      urls: imgList,
      current: src
    })
  },

  // 查看位置
  onLocationTap: function (e) {
    var latitude = this.data.notice.latitude
    var longitude = this.data.notice.longitude
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 28
    })
  },

  // 更改收藏状态
  onCollectionTap: function () {
    var that = this;
    var isLiked = that.data.isLiked;
    //数据库操作
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);
    query.get(that.data.notice.id).then(res => {
      var likerList = res.get('liker') || [];
      if (!isLiked) {
        //增
        likerList.push(app.globalData.currentUser.id);
        var likecount = res.get('likeCount') + 1;
      } else {
        // 删
        var index = contains(likerList, app.globalData.currentUser.id);
        likerList.splice(index, 1);
        var likecount = res.get('likeCount') - 1;
      }
      console.log(likerList)
      res.set('liker', likerList)
      res.set('likeCount', likecount)
      res.save().then((res) => {
        wx.showToast({
          title: (that.data.isLiked)? '收藏成功': '取消收藏',
        })
      });
    })

    that.setData({
      isLiked: !isLiked
    })

  },

  //跳转到编辑页
  toModify: function () {
    var modifyData = this.data.modifyData;

    wx.navigateTo({
      url: '../edit1/edit1?data=' + modifyData
    })
  }
})

function contains(arrays, obj) {
  var i = arrays.length;
  while (i--) {
    if (arrays[i] === obj) {
      return i;
    }
  }
  return false;
}