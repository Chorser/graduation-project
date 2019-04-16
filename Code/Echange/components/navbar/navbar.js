var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navbarData: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal) { }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height: '',
    //默认值  默认显示左上角
    navbarData: {
      showCapsule: true,
      isHomePage: false,
    }
  },

  attached: function () {
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: app.globalData.share
    })
    // 定义导航栏的高度,方便对齐
    this.setData({
      height: app.globalData.height
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 返回上一页面
    _navback() {
      wx.navigateBack()
    },
    //返回到首页
    _backhome() {
      wx.switchTab({
        url: '/pages/home/home',
      })
    },
    _navmap() {
      var that = this;

      //选择地点
      wx.chooseLocation({
        success: function (res) {
          console.log(res);
          console.log(res.name);
          that.setData({
            addressName: res.name,
            address: res.address
          })
          //选择地点之后返回到原来页面
          // wx.navigateTo({
          //   url: "/pages/home/home?addressname=" + res.name + "address=" + res.address
          // });

        },
        fail: function (err) {
          console.log(err)
        }

      })
    }
  }
})
