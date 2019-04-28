var app = getApp();
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
// 实例化API核心类
const mapManager = new QQMapWX({
  key: 'OZQBZ-O7UKU-LW4VZ-43PF2-NVGZ7-H4FNU'
});

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

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show() {
      var that = this;
      if(that.data.navbarData.isHomePage) {
        // 自动定位
        mapManager.search({
          keyword: '大学',
          success: function (res) {
            console.log(res.data);
            that.setData({
              addressName: res.data[0].title,
              address: res.data[0].address,
              location: res.data[0].location
            })
          },
          fail: function (res) {
            console.log(res);
          }
        })
      }
    },
    // hide() { },
    // resize() { },
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
        },
        fail: function (err) {
          console.log(err)
        }

      })
    }
  }
})
