var app = getApp();
var Bmob = require('../../utils/bmob.js');

// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var mapManager = new QQMapWX({
  key: 'OZQBZ-O7UKU-LW4VZ-43PF2-NVGZ7-H4FNU'
});

Page({
  data: {
    navbarData: {
      showCapsule: true, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·发布',
      isHomePage: false
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,

    typeIndex: 0,
    types: [],
    noteMaxLen: 200, //描述最多字数
    noteNowLen: 0, //描述当前字数

    title: "",
    description: "",
    price: null,

    address: "",
    longitude: 0,
    latitude: 0,

    isModify: false,
    objectId: ''
  },

  onLoad: function (options) {

    if (options.data) {
      //修改已保存的信息
      console.log(options.data);
      this.setOldData(options.data);
      this.setData({
        isModify: true
      })
    }

    var that = this;
    that.setData({
      src: "",
      isSrc: false,

      types: app.globalData.typeList
    })
    console.log(this.data.types)
  },

  setTitleValue: function (e) {
    this.data.title = e.detail.value;
  },

  setDescription: function (e) {
    var that = this;
    var value = e.detail.value;
    var len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      description: value,
      noteNowLen: len
    })
  },

  setPrice: function (e) {
    this.data.price = e.detail.value;
    console.log(this.data.price)
  },

  setAddress: function (e) {
    this.data.address = e.detail.value;
    console.log(this.data.address);
  },

  getPosition: function () {
    var that = this;
    // console.log(this.data.address)
    if (!this.data.address || this.data.address == ''){
      //获取当前位置
      wx.getLocation({
        type: 'wgs84',
        success(res) {
          console.log(res)
          var latitude = res.latitude
          var longitude = res.longitude
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude
          })
          // 调用接口转换成具体位置
          mapManager.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function (res) {
              console.log(res.result);
              that.setData({
                address: res.result.formatted_addresses.recommend
              })
            },
            fail: function (res) {
              console.log(res);
            },
          })
        },
        fail: function (res) {
          console.log(res);
        },
      })
    }
  },

  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },

  uploadImg: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 指定是压缩图
      sourceType: ['album', 'camera'], // 指定来源是相册和相机
      success: function (res) {
        var urlArr = new Array();
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)

        that.setData({
          isSrc: true,
          src: tempFilePaths
        })

        // var imgLength = tempFilePaths.length;
        // if (imgLength > 0) {
        //   var newDate = new Date();
        //   var newDateStr = newDate.toLocaleDateString();

        //   var j = 0;
        //   for (var i = 0; i < imgLength; i++) {
        //     var tempFilePath = [tempFilePaths[i]];
        //     var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
        //     if (extension) {
        //       extension = extension[1].toLowerCase();
        //     }
        //     var name = newDateStr + "." + extension; //上传的图片的别名
        //     that.setData({
        //       isSrc: true,
        //       src: name
        //     })

            // var file = new Bmob.File(name, tempFilePath);
            // file.save().then(function (res) {
            //   console.log(res)
            //   // return
            //   wx.hideNavigationBarLoading()
            //   var url = res.url();
            //   console.log("第" + i + "张图片的Url: " + url);

            //   urlArr.push({
            //     "url": url
            //   });
            //   j++;
            //   console.log(j, imgLength);
            //   // if (imgLength == j) {
            //   //   console.log(imgLength, urlArr);
            //   //如果担心网络延时问题，可以去掉这几行注释，就是全部上传完成后显示。
            //   // showPic(urlArr, that)
            //   // }

            // }, function (error) {
            //   console.log(error)
            // });
        //   }

        // }
      }
    })
  },

  //删除图片
  clearPic: function () {
    that.setData({
      isSrc: false,
      src: ""
    })
  },

  // 创建
  submit: function () {
    var that = this;

    if (!this.validate()) {
      return ;
    }
    else {
      console.log("校验完毕");

      var user = Bmob.User.current();
      var me = new Bmob.User();
      me.id = user.id;
      me.avatar = user.get("avatarUrl");
      // console.log(me.avatar)
      var Notice = Bmob.Object.extend("Published_notice");
      var notice = new Notice();
      
      notice.set('publisher', me)
      notice.set('userId', user.id) //方便判断
      notice.set('title', this.data.title)
      notice.set('description', this.data.description)
      notice.set('typeId', parseInt(this.data.typeIndex))
      notice.set('price', parseFloat(this.data.price))
      
      notice.set('address', this.data.address)
      notice.set('latitude', this.data.latitude)
      notice.set('longitude', this.data.longitude)

      notice.set('viewCount', 0)
      notice.set('likeCount', 0);
      
      if (that.data.isSrc == true) {
        var name = that.data.src;
        var file = new Bmob.File(name, that.data.src);
        file.save();
        notice.set('pic1', file);
      }

      //向数据库添加数据
      notice.save(null, {
        success: function (result) {
          console.log('发布成功')
          wx.showToast({
            title: '发布成功',
            mask: true
          });
          
          wx.navigateTo({
            url: '../myPost/myPost',
          })
        },
        error: function (result, error) {
          console.log("发布失败=", error);
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          });
        }
      })

    }
  },

  setOldData: function (data) {
    var data = JSON.parse(data);
    console.log(data);
    this.setData({
      title: data.title,
      description: data.description,
      noteNowLen: data.description.length,
      typeIndex: data.typeId,
      price: data.price,
      address: data.address,
      longitude: data.longitude,
      latitude: data.latitude,
      isSrc: true,
      src: data.pic || '',

      objectId: data.id
    })
  },

  // 修改
  save: function () {
    var that = this;
    var Notice = Bmob.Object.extend("Published_notice");
    var query = new Bmob.Query(Notice);

    query.get(that.data.objectId, {
      success: function (result) {
        result.set('title', that.data.title)
        result.set('description', that.data.description)
        result.set('price', that.data.price)
        result.set('typeId', parseInt(that.data.typeIndex));
        // 图片上传
        if (that.data.isSrc == true) {
          var name = that.data.src;
          var file = new Bmob.File(name, that.data.src);
          file.save();
          
          result.set('pic1', file);
        }

        result.save().then((res) => {
          wx.showToast({
            title: '修改成功！',
          })

          wx.navigateBack({
            delta: 2 //回跳两页
          })
        })
      }
    })
  },

  validate: function () {
    if (this.data.title == '') {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return false;
    } else if (this.data.description == '') {
      wx.showToast({
        title: '请输入物品描述',
        icon: 'none'
      })
      return false;
    }
    //TODO 更多校验
    
    return true;
  }
})