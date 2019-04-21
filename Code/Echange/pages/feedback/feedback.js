var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var app = getApp();

Page({
  data: {
    navbarData: {
      showCapsule: true, //是否显示左上角图标：1表示显示，0表示不显示
      title: "Echange·问题反馈",
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

    avatarUrl: '',
    nickName: '',
    length: 0
  },

  onLoad: function () {
    this.user = app.globalData.currentUser;    
    // console.log('bug:', this.user);
    
    this.setData({
      avatarUrl: this.user.get('avatar')._url,
      nickName: this.user.get('nickName'),
    })
  },

  addFeedback: function (event) {
    var that = this;
    var title = event.detail.value.title;
    var content = event.detail.value.content;

    if (!title) {
      common.showTip("标题不能为空", "loading");
      return false;
    }
    else if (!content) {
      common.showTip("内容不能为空", "loading");
      return false;
    }
    else {
      that.setData({
        loading: true
      })

      var info = '';
      wx.getSystemInfo({
        success: function(res) {
          console.log(res)
          info = '**手机型号：' + res.brand + '**手机系统：' + res.system +'\n**微信版本号：'+ res.version;
        },
      })

      var user = Bmob.User.current();
      var me = new Bmob.User();
      me.id = user.id;

      //发送反馈
      var Diary = Bmob.Object.extend("Feedback");
      var diary = new Diary();
      diary.set("title", title);
      diary.set("content", content);
      diary.set("feedInfo", info);
      diary.set("feedUser", me);

      //添加数据，第一个入口参数是null
      diary.save(null, {
        success: function (result) {
          // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
          common.showModal('保存反馈成功，点击确定返回。', '提示', function () {
            wx.navigateBack();
          });

          // wx.navigateBack();
          that.setData({
            loading: false
          })

        },
        error: function (result, error) {
          // 添加失败
          common.showModal('发送反馈失败，请重新发送');
        }
      });
    }

  },

  //统计输入长度
  userInput: function (e) {
    this.setData({
      length: e.detail.value.length
    })
  }
})