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

  onLoad: function(options) {
    if (options.isMyPost) {
      //用户查看自己的发布商品详情 特殊处理
      this.setData({
        isMyPost: true,
        modifyData: options.data
      })
    }

    var noPict = false,
      showDots = false;
    var data = JSON.parse(options.data)
    // console.log(data)

    if (!data.pic || data.pic == '') {
      noPict = true;
    } else {
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
  previewImg: function(e) {
    var imgList = e.currentTarget.dataset.list; //获取data-list
    var src = e.currentTarget.dataset.src; //获取data-src

    wx.previewImage({
      urls: imgList,
      current: src
    })
  },

  // 查看位置
  onLocationTap: function(e) {
    var latitude = this.data.notice.latitude
    var longitude = this.data.notice.longitude
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 28
    })
  },

  // 更改收藏状态
  onCollectionTap: function() {
    var that = this;
    var isLiked = that.data.isLiked; //是否是收藏状态

    var userId = app.globalData.currentUser.id;
    var isme = new Bmob.User();
    isme.id = userId;

    var wid = that.data.notice.id; //商品Id
    var publisherId = that.data.notice.publisherId;

    //数据库操作
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);
    query.get(wid).then(res => {
      var likerList = res.get('liker') || [];
      if (!isLiked) {
        //增
        likerList.push(app.globalData.currentUser.id);
        var likecount = res.get('likeCount') + 1;

        // 向likes表里添加数据
        var Like = Bmob.Object.extend("Likes");
        var like = new Like();
        like.set('user', isme);
        like.set('notice', wid);
        like.save(null, {
          success: function(result) {
            console.log("创建成功, objectId:" + result.id);
          },
          fail: function(error) {
            console.log("查询失败: " + error.code + " " + error.message);
          }
        })
      } else {
        // 删
        var id = app.globalData.currentUser.id;
        var index = contains(likerList, id);
        likerList.splice(index, 1);
        var likecount = res.get('likeCount') - 1;

        res.set('liker', likerList)
        res.set('likeCount', likecount)
        res.save().then((res) => {
          wx.showToast({
            title: (that.data.isLiked) ? '收藏成功' : '取消收藏',
          })
        });
        // likes表里删除数据
        var Like = Bmob.Object.extend("Likes");

        if (!this.likeObjectId) {
          var query = new Bmob.Query(Like);
          var me = new Bmob.User();
          me.id = id;
          query.equalTo("user", me);
          query.equalTo("notice", this.data.notice.id);
          // 查询所有数据
          query.find({
            success: function(results) {
              console.log(results);
            },
            fail: function(error) {
              console.log("查询失败: " + error.code + " " + error.message);
            }
          });
        }
      }

      //在生成消息之前，先遍历消息表，如果要生成的消息在表中已经存在，则不生成消息
      var Message = Bmob.Object.extend("Message");
      var messageQuery = new Bmob.Query(Message);

      if (!isLiked) { //如果是收藏，查询是否存在收藏记录
        messageQuery.equalTo("user", isme);
        messageQuery.equalTo("wid", wid);
        // messageQuery.equalTo("behavior", 1);
        messageQuery.find({
          success: function(result) {
            console.log(result);
            if (result.length == 0) { //如果消息表中不存在该条消息，则生成新消息
              // var value = wx.getStorageSync("my_avatar") //我的头像
              // var my_username = wx.getStorageSync("my_username") //我的用户名

              var value = app.globalData.currentUser.avatar;
              var username = app.globalData.currentUser.nickName;

              var message = new Message();
              message.set("msgType", 1); // 1为收藏
              message.set("avatar", value); //我的头像
              message.set("userName", username); // 我的名称
              message.set("user", isme);
              message.set("wid", wid); //商品ID
              message.set("fid", publisherId);
              message.set("is_read", false); //是否已读 boolean
              message.save();
            }
          }
        })

      } else { //如果是取消收藏，查询是否存在收藏记录
        plyerQuery.equalTo("user", isme);
        plyerQuery.equalTo("wid", wid);
        plyerQuery.equalTo("msgType", 2);
        plyerQuery.find({
          success: function(result) {
            console.log(result)
            if (result.length == 0) { //如果消息表中不存在该条消息，则生成新消息
              // var value = wx.getStorageSync("my_avatar")
              // var my_username = wx.getStorageSync("my_username")
              var value = app.globalData.currentUser.avatar;
              var username = app.globalData.currentUser.nickName;

              var message = new Message();
              message.set("noticetype", "2");
              message.set("avatar", value); //我的头像
              message.set("username", username); // 我的名称
              message.set("uid", isme);
              message.set("wid", wid); //活动ID
              message.set("fid", publisherId); //
              message.set("is_read", false); //是否已读,0代表没有,1代表读了
              message.save();
            }
          }
        })
      }
    })

    that.setData({
      isLiked: !isLiked
    })

  },

  //取消收藏 向liker 表中删除数据
  downLike: function(ress) {
    var me = new Bmob.User();
    me.id = ress.data;
    var Events = Bmob.Object.extend("Events");
    var event = new Events();
    event.id = optionId;
    var Likes = Bmob.Object.extend("Likes");
    var like = new Bmob.Query(Likes);
    like.equalTo("liker", me);
    like.equalTo("event", event);
    like.destroyAll({
      success: function() {
        console.log("删除点赞表中的数据成功");
      },
      error: function(error) {
        console.log("删除点赞表的数据失败");
        console.log(error);
      }
    })
  },

  // 留言
  openMessage: function() {
    this.setData({
      hideModal: false
    })
  },
  setComment: function(e) {
    this.setData({
      comment: e.detail.value
    })
  },
  cancel: function() {
    this.setData({
      hideModal: true
    })
  },
  confirm: function() {
    this.createComment(this.data.comment);

    this.setData({
      hideModal: true
    })
  },
  createComment: function(str) {
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
        success: function(userObject) {
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
            success: function(res) {
              // var 
            }
          })
        }

      });
    }
  },

  //跳转到编辑页
  toModify: function() {
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