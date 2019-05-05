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
    isSoldOut: false,

    hideModal: true, //隐藏留言输入框
    buyModal: true, //隐藏购买框
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
    var isSoldOut = false;
    (data.status == 1) ? isSoldOut = true: isSoldOut = false;
    this.setData({
      notice: data,
      picList: list || [],
      noPic: noPict,
      indicatorDots: showDots,

      isLiked: data.isLiked,
      isSoldOut: isSoldOut
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
    var Notice = Bmob.Object.extend("Published_notice");
    var noticePointer = new Notice();
    noticePointer.id = wid;
    var publisherId = that.data.notice.publisherId;

    //数据库操作
    var query = new Bmob.Query(Notice);
    query.get(wid).then(res => {
      // 修改Likes表数据
      var Like = Bmob.Object.extend("Likes");

      var Message = Bmob.Object.extend("Message");
      var messageQuery = new Bmob.Query(Message);
      messageQuery.equalTo("user", isme);
      messageQuery.equalTo("wid", wid);

      var likerList = res.get('liker') || [];
      if (!isLiked) { //非收藏状态
        //增
        likerList.push(app.globalData.currentUser.id);
        var likecount = res.get('likeCount') + 1;

        // 向likes表里添加数据
        var like = new Like();
        like.set('user', isme);
        like.set('notice', noticePointer);
        like.save(null, {
          success: function(result) {
            console.log("likes表数据新增成功, objectId:" + result.id);
          },
          fail: function(error) {
            console.log("likes表数据新增失败: " + error.code + " " + error.message);
          }
        })

        // 发送 收藏消息 给发布人
        //在生成消息之前，先遍历消息表，如果要生成的消息在表中已经存在，则不生成消息
        messageQuery.equalTo("msgType", 1);
        messageQuery.find({
          success: function(result) {
            if (result.length == 0) { //如果消息表中不存在该条消息，则生成新消息
              console.log("不存在该条消息，可以生成新消息");
              var value = app.globalData.currentUser.avatar;
              var username = app.globalData.currentUser.nickName;
              console.log(app.globalData.currentUser);

              var message = new Message();
              message.set("msgType", 1); // 1为收藏
              message.set("avatar", value); //我的头像
              message.set("userName", username); // 我的名称
              message.set("user", isme);
              message.set("wid", wid); //商品ID
              message.set("fid", publisherId);
              message.set("is_read", false); //是否已读 boolean
              message.save().then((res) => {
                console.log("消息生成 ", res);
              });
            } else {
              console.log(result);
            }
          }
        })


      } else { // 已是收藏状态
        // 删
        var index = contains(likerList, userId);
        likerList.splice(index, 1);
        var likecount = res.get('likeCount') - 1;
        res.set('liker', likerList)
        res.set('likeCount', likecount)
        res.save().then((res) => {
          console.log("likes表数据删除 ", res);
        });

        // likes表里删除数据？？怎么删
        // 获取objectId再destroy
        if (!this.likeObjectId) {
          var likeQuery = new Bmob.Query(Like);
          likeQuery.equalTo("user", isme);
          likeQuery.equalTo("notice", wid);
          // 查询所有数据
          likeQuery.find({
            success: function(results) {
              console.log(results);
            },
            fail: function(error) {
              console.log("查询失败: ", error.code, " ", error.message);
            }
          });
        }

        messageQuery.equalTo("msgType", 2);
        messageQuery.find({
          success: function(result) {
            console.log(result)
            if (result.length == 0) { //如果消息表中不存在该条消息，则生成新消息
              // var value = wx.getStorageSync("my_avatar")
              // var my_username = wx.getStorageSync("my_username")
              var value = app.globalData.currentUser.get("avatar");
              var username = app.globalData.currentUser.get("nickName");

              var message = new Message();
              message.set("msgType", "2");
              message.set("avatar", value); //我的头像
              message.set("username", username); // 我的名称
              message.set("uid", isme);
              message.set("wid", wid); //活动ID
              message.set("fid", publisherId); //发布人Id
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
    wx.showToast({
      title: (that.data.isLiked) ? '收藏成功' : '取消收藏',
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
  // 数据库 Comment 增加记录
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
          comment.set('notice', notice);
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
              // TODO 显示留言
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
  },

  //订购确认
  toBuy: function() {
    var that = this;
    wx.showModal({
      title: '订购确认',
      content: '需要支付' + this.data.notice.price + '元，确定要购买该商品吗？',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')

          // 物品状态改为已出售
          var Notice = Bmob.Object.extend("Published_notice");
          var notice = new Notice();
          notice.id = that.data.notice.id;

          var noticeQuery = new Bmob.Query(Notice);
          noticeQuery.get(that.data.notice.id).then(res => {
            res.set("status", 1);
            res.save();

            let temp =  that.data.notice;
            temp.status = 1;
            that.setData({
              notice: temp,
              isSoldOut: true
            })
            //buyer
            var isme = new Bmob.User();
            isme.id = app.globalData.currentUser.id;
            
            var seller = new Bmob.User();
            seller.id = that.data.notice.publisherId;

            // 增加订单
            createOrder({
              publisherId: seller.id,
              price: that.data.notice.price,
              notice: notice,
              isme: isme,
              seller: seller
            })

            // 发消息
            createMessage({
              type: 5, // 5为购买
              // avatar: avatar,
              // username: username,
              isme: isme,
              wid: notice.id,
              wName: that.data.notice.title,
              publisherId: seller.id
            });
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
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

function createOrder(data) {
  var Order = Bmob.Object.extend("Order")
  var order = new Order();  
  data.isme.username = app.globalData.currentUser.get("nickName");
  data.isme.avatar = app.globalData.currentUser.get("avatar");

  order.set('totalPrice', data.price);
  order.set('buyer', data.isme);
  order.set('seller', data.seller);
  order.set('notice', data.notice);
  order.save().then((res) => {
    console.log("订单创建成功 ", res);
    
    wx.showToast({
      title: '购买成功',
    })
  });
}

function createMessage(data) {
  var Message = Bmob.Object.extend("Message");
  var message = new Message();
  message.set("msgType", data.type); // 5为购买
  message.set("avatarUrl", app.globalData.currentUser.get("avatar").url); //我的头像
  message.set("userName", app.globalData.currentUser.get("nickName")); // 我的名称
  
  message.set("user", data.isme);
  message.set("wid", data.wid); //商品ID
  message.set("fid", data.publisherId);
  message.set("is_read", false); //是否已读 boolean
  message.save().then((res) => {
    console.log("创建消息 ", res);
  });
}