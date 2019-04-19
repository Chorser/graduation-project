var Bmob = require('../../utils/bmob.js');
const app = getApp()

Page({
  data: {

    navbarData: {
      showCapsule: true, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·物品详情',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,


    noPic: false, //是否显示图片
    indicatorDots: true, // 是否显示小点

    picList: [],
    notice: null,

    isMyPost: false,
    isLiked: false,

    hideModal: true, //隐藏留言输入框
    comment: ''
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

        // 向likes表里添加数据
        var Like = Bmob.Object.extend("Likes");
        var like = new Like();

        var user = Bmob.User.current();
        var me = new Bmob.User();
        me.id = user.id;
        like.set('user', me);
        like.set('notice', this.data.notice);
        like.save(null, {
          success: function (result) {
            console.log("日记创建成功, objectId:" + result.id);
            this.likeObjectId = result.id;
          },
          fail: function (error) {
            console.log("查询失败: " + error.code + " " + error.message);
          }
        })

      } else {
        // 删
        var index = contains(likerList, app.globalData.currentUser.id);
        likerList.splice(index, 1);
        var likecount = res.get('likeCount') - 1;

        // likes表里删除数据
        var Like = Bmob.Object.extend("Likes");

        if (!this.likeObjectId) {
          var query = new Bmob.Query(Like);
          var me = new Bmob.User();
          me.id = user.id;
          query.equalTo("user", me);
          query.equalTo("notice", this.data.notice);
          // 查询所有数据
          query.find({
            success: function (results) {
              console.log(results);
            },
            fail: function (error) {
              console.log("查询失败: " + error.code + " " + error.message);
            }
          });
        }
      }
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

  // 留言
  sendMessage: function () {
    this.setData({
      hideModal: false
    })
  },
  setComment: function (e) {
    this.setData({
      comment: e.detail.value
    })
  },
  cancel: function () {
    this.setData({
      hideModal: true
    })
  },
  confirm: function () {
    this.setData({
      hideModal: true
    })

    this.createComment(this.data.comment);
  },
  createComment: function (str) {
    var that = this;
    // 校验
    if (!str || str.length == 0) {
      wx.showToast({
        title: '请输入留言内容',
      });
    } else {
      var User = Bmob.Object.extend('_User')
      var query = new Bmob.Query(User);
      var myId = app.globalData.currentUser.id
      query.get(myId, {
        success: function (userObject) {
          var Notice = Bmob.Object.extend("Published_notice");
          var notice = new Notice();
          notice.id = that.data.notice.id;
          var me = new Bmob.User();
          me.id = myId;
          //向数据库插入一条记录
          var Comments = Bmob.Object.extend('Comments');
          var comment = new Comments();
          comment.set('content', str);
          comment.set('notice', notice); // ??
          comment.set('publisher', me);

          // if (that.data.isToResponse) { //如果是回复的评论
          //   isReply = true;
          //   var olderName = that.data.responseName;
          //   var Comments1 = Bmob.Object.extend("Comments");
          //   var comment1 = new Comments1();
          //   comment1.id = that.data.pid; //评论的评论Id
          //   comment.set("olderUserName", olderName);
          //   comment.set("olderComment", comment1);
          // }
          comment.save(null, {
            success: function (res) {
              // var 
            }
          })
        }

      });
    }
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