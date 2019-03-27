var Bmob = require('../../utils/bmob.js');

Page({
  data: {
    index: 0,
    type: ['美妆服饰', '电子产品', '学习用品', '生活用品'],
    typeArray: [{
        id: 0,
        name: '美妆服饰'
      },
      {
        id: 1,
        name: '电子产品'
      },
      {
        id: 2,
        name: '学习用品'
      },
      {
        id: 3,
        name: '生活用品'
      }
    ],
  },

  title: null,
  description: null,

  setTitleValue: function(e) {
    console.log(e.detail.value);
    this.title = e.detail.value;
  },

  setDescription: function(e) {
    console.log(e.detail.value);
    this.description = e.detail.value;
  },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  uploadImg: function(e) {
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        wx.showNavigationBarLoading()
        that.setData({
          loading: false
        })
        var urlArr = new Array();
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        var imgLength = tempFilePaths.length;
        if (imgLength > 0) {
          var newDate = new Date();
          var newDateStr = newDate.toLocaleDateString();

          var j = 0;
          for (var i = 0; i < imgLength; i++) {
            var tempFilePath = [tempFilePaths[i]];
            var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
            if (extension) {
              extension = extension[1].toLowerCase();
            }
            var name = newDateStr + "." + extension; //上传的图片的别名      

            var file = new Bmob.File(name, tempFilePath);
            file.save().then(function(res) {
              console.log(res)
              // return
              wx.hideNavigationBarLoading()
              var url = res.url();
              console.log("第" + i + "张Url" + url);

              urlArr.push({
                "url": url
              });
              j++;
              console.log(j, imgLength);
              // if (imgLength == j) {
              //   console.log(imgLength, urlArr);
              //如果担心网络延时问题，可以去掉这几行注释，就是全部上传完成后显示。
              // showPic(urlArr, that)
              // }

            }, function(error) {
              console.log(error)
            });
            //如果你突然发现这个文件传了又想立即删了，可以直接执行
            // file.destroy();
          }

        }
      }
    })
  },

  submit: function() {
    if (!this.title || this.title == '') {
      wx.showToast({
        title: '标题不能为空',
        icon: 'none'
      })
      return;
    }

    if (!this.description || this.title == '') {
      wx.showToast({
        title: '描述不能为空',
        icon: 'none'
      })
      return;
    }

    var user = Bmob.User.current();
    // 创建Bmob.Object子类
    var Notice = Bmob.Object.extend("Published_notice");
    // 创建该类的一个实例
    var notice = new Notice();
    notice.set('userId', user.getUsername())
    notice.set('title', this.title)
    notice.set('description', this.description)
    notice.set('typeId', parseInt(this.data.index))

    notice.save(null, {
      success: function(result) {
        console.log('发布成功')
        wx.showToast({
          title: '发布成功',
        });
      }
    })
  }
})