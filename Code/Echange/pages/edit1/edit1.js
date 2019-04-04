var Bmob = require('../../utils/bmob.js');

Page({
  data: {
    typeIndex: 0,
    types: ['美妆服饰', '电子产品', '学习用品', '生活用品'],
    description: "",
    noteMaxLen: 200, //描述最多字数
    noteNowLen: 0, //描述当前字数
  },

  title: "",

  onLoad: function () {
    var that = this;
    that.setData({
      src: "",
      isSrc: false,
    })
  },

  setTitleValue: function (e) {
    this.title = e.detail.value;
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

  submit: function () {
    var that = this;

    if (this.title == '') {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
    } else if (this.data.description == '') {
      wx.showToast({
        title: '请输入物品描述',
        icon: 'none'
      })
    }
    else {
      console.log("校验完毕");

      var user = Bmob.User.current();
      var me = new Bmob.User();
      me.id = user.id;
      me.avatar = user.get("avatarUrl");
      console.log(me.avatar)
      var Notice = Bmob.Object.extend("Published_notice");
      var notice = new Notice();
      
      notice.set('publisher', me)
      notice.set('userId', user.id)
      notice.set('title', this.title)
      notice.set('description', this.data.description)
      notice.set('typeId', parseInt(this.data.typeIndex))
      
      if (that.data.isSrc == true) {
        var name = that.data.src;
        console.log(name)
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
          //添加失败
          console.log("发布失败=", error);
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          });
        }
      })

    }

  }
})