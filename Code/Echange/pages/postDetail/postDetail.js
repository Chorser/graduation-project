const app = getApp()
var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js');
Bmob.initialize(
  "9a68cce6689ca69dcd286c4e4eba7d07", "a5e489144f78cfd52d57e71375bda36d");

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
    comment: '',

    commentList: [], //评论
  },

  onLoad: function (options) {

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
    (data.status == 1) ? isSoldOut = true : isSoldOut = false;
    this.setData({
      notice: data,
      picList: list || [],
      noPic: noPict,
      indicatorDots: showDots,

      isLiked: data.isLiked || false,
      isSoldOut: isSoldOut
    })

    console.log(this.data.notice)

    this.getCommentList();
  },

  //预览图片,多图可左右滑动
  previewImg: function (e) {
    var imgList = e.currentTarget.dataset.list; //获取data-list
    var src = e.currentTarget.dataset.src; //获取data-src

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
    var isLiked = that.data.isLiked; //是否已是收藏状态

    var userId = app.globalData.currentUser.id;
    var isme = new Bmob.User();
    isme.id = userId;

    var wid = that.data.notice.id; //商品Id
    var wTitle = that.data.notice.title; //商品名称
    var Notice = Bmob.Object.extend("Published_notice");

    var publisherId = that.data.notice.publisherId;

    //数据库操作
    var noticeQuery = new Bmob.Query(Notice);
    noticeQuery.get(wid).then(res => {
      var Like = Bmob.Object.extend("Likes");

      var Message = Bmob.Object.extend("Message");
      var messageQuery = new Bmob.Query(Message);
      messageQuery.equalTo("user", isme);
      messageQuery.equalTo("wid", wid);

      var likerList = res.get('liker') || [];
      if (!isLiked) { //非收藏状态
        likerList.push(app.globalData.currentUser.id); // 在liker[]里加入我的Id
        var likecount = res.get('likeCount') + 1; // likecount数 + 1
        //增
        // 向Likes表里添加数据
        var noticePointer = new Notice();
        noticePointer.id = wid;

        var like = new Like();
        like.set('user', isme);
        like.set('notice', noticePointer);
        like.save(null, {
          success: function (result) {
            console.log("likes表数据新增成功, objectId:" + result.id);
          },
          fail: function (error) {
            console.log("likes表数据新增失败: " + error.code + " " + error.message);
          }
        })

        // 发送 收藏消息 给发布人
        //在生成消息之前，先遍历消息表，如果要生成的消息在表中已经存在，则不生成消息
        messageQuery.equalTo("msgType", 1);
        messageQuery.find({
          success: function (result) {
            if (result.length == 0) { //如果消息表中不存在该条消息，则生成新消息
              console.log("不存在该条消息，可以生成新消息");
              var value = app.globalData.currentUser.avatar;
              var username = app.globalData.currentUser.nickName;
              console.log(app.globalData.currentUser);

              // 发消息
              that.createMessage({
                type: 1, // 5为购买
                isme: isme,
                wid: wid,
                wTitle: wTitle,
                publisherId: publisherId
              });

            } else {
              console.log("消息表中已存在该条消息，不生成新消息");
              console.log(result);
            }
          }
        })


      } else { // 已是收藏状态
        // 删
        var index = contains(likerList, userId);
        likerList.splice(index, 1); // 在liker[]里除去我的Id
        var likecount = res.get('likeCount') - 1; // likecount数 - 1

        // likes表里删除数据
        // 获取objectId再destroy
        var likeQuery = new Bmob.Query(Like);
        likeQuery.equalTo("user", isme);
        likeQuery.equalTo("notice", wid);
        // 查询所有数据
        likeQuery.find({
          success: function (results) {
            // console.log("likes表里要删除的数据：", results);
            let res = results[0];

            res.destroy().then(res => {
              console.log(res)
            }).ctach(err => {
              console.log(err)
            })
            console.log("likes表里删除数据成功 ", res)

          },
          fail: function (error) {
            console.log("查询失败: ", error.code, " ", error.message);
          }
        });


        messageQuery.equalTo("msgType", 2);
        messageQuery.find({
          success: function (result) {
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
              message.set("is_read", false); //是否已读
              message.set("is_delete", false); //是否删除 
              message.save();
            }
          }
        })
      }
      res.set('liker', likerList)
      res.set('likeCount', likecount)
      res.save().then((res) => {
        console.log("修改该商品的收藏数据 ", res);
      });
    })

    that.setData({
      isLiked: !isLiked
    })
    wx.showToast({
      title: (that.data.isLiked) ? '收藏成功' : '取消收藏',
    })
  },

  //取消收藏 liker 表中删除数据
  // downLike: function (ress) {
  //   var me = new Bmob.User();
  //   me.id = ress.data;
  //   var Events = Bmob.Object.extend("Events");
  //   var event = new Events();
  //   event.id = optionId;
  //   var Likes = Bmob.Object.extend("Likes");
  //   var likeQuery = new Bmob.Query(Likes);
  //   likeQuery.equalTo("liker", me);
  //   likeQuery.equalTo("event", event);
  //   likeQuery.find({
  //     success: function (res) {

  //       console.log("删除收藏表中的数据成功");
  //     },
  //     error: function (error) {
  //       console.log("删除收藏表的数据失败");
  //       console.log(error);
  //     }
  //   })
  // },

  // 获取已有留言记录
  getCommentList: function () {
    var that = this;
    var Comments = Bmob.Object.extend("Comments");
    var commentQuery = new Bmob.Query(Comments);

    var Notice = Bmob.Object.extend("Published_notice");
    var notice = new Notice();
    notice.id = this.data.notice.id;
    commentQuery.equalTo('notice', notice);
    commentQuery.include("publisher"); // 同时获取发布者信息
    commentQuery.descending('createdAt');
    commentQuery.find({
      success: function (res) {
        var list = [];
        console.log("getCommentList", res);
        res.forEach(function (item) {
          var pAvatar = item.get('publisher').avatar.url;
          var pName = item.get('publisher').nickName;
          var createdAt = item.createdAt;
          var pastTime = util.pastTime(createdAt);

          var content = item.get('content');

          var jsonA;
          jsonA = {
            "pAvatar": pAvatar || '',
            "pName": pName || '',
            "content": content || '',
            "pastTime": pastTime || '',
          }
          list.push(jsonA);
        })

        that.setData({
          commentList: list
        })
      }
    })
  },

  // 打开留言输入框
  openComment: function () {
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
    this.createComment(this.data.comment);

    this.setData({
      hideModal: true
    })
  },
  // 数据库 Comment 增加记录
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
            success: function (res) {
              // TODO 显示留言

              var user = app.globalData.currentUser;
              var pAvatar = user.get("avatar")._url;
              var pName = user.get("nickName");
              // var createdAt = item.createdAt;
              // var pastTime = util.pastTime(createdAt);
              // var content = item.get('content');

              var jsonA;
              jsonA = {
                "pAvatar": pAvatar || '',
                "pName": pName || '',
                "content": str || '',
                "pastTime": '刚刚',
              }
              // 数据插入需要放在数组第一位
              // list.push(jsonA);
              var list = [jsonA].concat(that.data.commentList);

              that.setData({
                commentList: list
              })
            }
          })

          var seller = new Bmob.User();
          seller.id = that.data.notice.publisherId;
          // 发消息
          that.createMessage({
            type: 3, // 3为评论
            isme: me,
            wid: notice.id,
            wTitle: that.data.notice.title,
            publisherId: seller.id
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
  },

  //订购确认
  bindFormSubmit: function (e) {
    var that = this;
    // 获取表单id
    var formId = e.detail.formId;
    // 非真机运行时 formId 为 the formId is a mock one
    console.log('表单id:', formId);

    var price = this.data.notice.price;
    if (price == null || price == '') {
      wx.showToast({
        title: '请先联系卖家改价',
      })
    } else {

      wx.showModal({
        title: '订购确认',
        content: '需要支付' + this.data.notice.price + '元，确定要购买该商品吗？',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击购买')

            var Notice = Bmob.Object.extend("Published_notice");
            var notice = new Notice();
            notice.id = that.data.notice.id;

            var noticeQuery = new Bmob.Query(Notice);
            noticeQuery.get(notice.id).then(res => {
              res.set("status", 1);   // 物品状态改为已出售
              res.save();

              let t = that.data.notice;
              t.status = 1;
              that.setData({
                notice: t,
                isSoldOut: true
              })

              //buyer
              var isme = new Bmob.User();
              isme.id = app.globalData.currentUser.id;

              var seller = new Bmob.User();
              seller.id = that.data.notice.publisherId;

              // 增加订单
              that.createOrder({
                publisherId: seller.id,
                price: that.data.notice.price,
                notice: notice,
                isme: isme,
                seller: seller
              });

            // 发消息
              that.createMessage({
                type: 5, // 5为购买
                isme: isme,
                wid: notice.id,
                wTitle: that.data.notice.title,
                publisherId: seller.id
              });

            });

            // 获取发布人的openId
            var User = Bmob.Object.extend("_User");
            var userQuery = new Bmob.Query(User);

            // 消息推送 每个应用，每天有100条的免费额度
            var currentU = Bmob.User.current();
            var temp = {
              "touser": wx.getStorageSync("openid"), //只能发给点击的人，即用户自己   openId
              "template_id": "5VJuboIygG9mC7TzqFyqGCRE3-eHzUY5ieoWYfCieoM",
              "form_id": formId,
              "page": '',
              "data": {
                "keyword1": { //订单编号
                  "value": that.data.orderId
                },
                "keyword2": {  //物品名称
                  "value": that.data.notice.title
                },
                "keyword3": { // 金额
                  "value":  that.data.notice.price
                },
                "keyword4": { // 下单时间
                  "value": util.formatTime(new Date())
                },
              },
              "emphasis_keyword": "keyword3.DATA" //模板需要放大的关键词，不填则默认无放大
            }
            console.log(temp);
            Bmob.sendMessage(temp).then(function (obj) {
              console.log('发送成功', obj);
            }, function (err) {
              console.log('失败', err);
            });

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }

      })

    }

  },

  createOrder: function (data) {
    var that = this;
    var Order = Bmob.Object.extend("Order");
    var order = new Order();
    data.isme.username = app.globalData.currentUser.get("nickName");
    data.isme.avatar = app.globalData.currentUser.get("avatar").url;

    order.set('totalPrice', data.price);
    order.set('buyer', data.isme);
    order.set('seller', data.seller);
    order.set('notice', data.notice);
    order.save().then((res) => {
      console.log("订单创建成功 ", res);
      console.log(res);

      wx.showToast({
        title: '购买成功',
      })

      that.data.orderId = res.id;
      console.log(that.data.orderId);
    });
  },

  createMessage: function (data) {
    var Message = Bmob.Object.extend("Message");
    var message = new Message();
    message.set("msgType", data.type);
    message.set("avatarUrl", app.globalData.currentUser.get("avatar").url); //我的头像
    message.set("userName", app.globalData.currentUser.get("nickName")); // 我的名称

    message.set("user", data.isme);
    message.set("wid", data.wid); //商品ID
    message.set("wTitle", data.wTitle); // 商品发布标题
    message.set("fid", data.publisherId);
    message.set("is_read", false); //是否已读
    message.set("is_delete", false);
    message.save().then((res) => {
      console.log("创建消息成功", res);
    });
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