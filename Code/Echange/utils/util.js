function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function buttonClicked(self) {
  self.setData({
    buttonClicked: true
  })
  setTimeout(function () {
    self.setData({
      buttonClicked: false
    })
  }, 500)

}

  /*格式 getBeforeDate('2015,5,20') */
  /*
  * auth:120975587@qq.com
  * time:2015.5.6 9:45
  * ******************
  */
function getBeforeDate(n) {
  var now = new Date();
  var aftertime = new Date(n);
  var year = now.getFullYear();
  var mon = now.getMonth() + 1;
  var day = now.getDate();
  var year_after = aftertime.getFullYear();
  var mon_after = aftertime.getMonth() + 1;
  var day_after = aftertime.getDate();
  var chs = 0;
  //获取当月的天数
  function DayNumOfMonth(Year, Month) {
    return 32 - new Date(Year, Month - 1, 32).getDate();
  }
  if (aftertime.getTime() - now.getTime() < 0) {
    var temp1 = day_after;
    var temp2 = mon_after;
    var temp3 = year_after;
    day_after = day;
    mon_after = mon;
    year_after = year;
    day = temp1;
    mon = temp2;
    year = temp3;
  }
  if (year == year_after) { // 不跨年
    if (mon == mon_after) { // 不跨年不跨月
      chs += day_after - day;
      return chs + '天前发布'
    } else {//不跨年跨月
      chs += DayNumOfMonth(year, mon) - day + 1;//加上第一个不满的
      for (var i = 1; i < mon_after - mon; i++) {
        chs += DayNumOfMonth(year, mon + i);
      }
      chs += day_after - 1;//加上
     return chs + '个月前发布' 
    }
  } else {//存在跨年
    chs += DayNumOfMonth(year, mon) - day + 1;//加上开始年份不满的一个月
    for (var m = 1; m < 12 - mon; m++) {
      chs += DayNumOfMonth(year, mon + m);
    }
    for (var j = 1; j < year_after - year; j++) {
      if ((year + j) % 400 == 0 || (year + j) % 4 == 0 && (year + j) % 100 != 0) {
        chs += 366;
      } else {
        chs += 365;
      }
    }
    for (var n = 1; n <= mon_after; n++) {
      chs += DayNumOfMonth(year_after, n);
    }
    chs += day_after - 1;
    return chs + '年前发布'
  }
  // if (aftertime.getTime() - now.getTime() < 0) {
  //   return -chs;
  // } else {
  //   return chs;
  // }
}

/**
 * 人性化时间处理 传入时间戳
 */
function pastTime(date) {
  // date = date.substring(0, 19);
  date = date.replace(/-/g, '/');
  var timestamp = new Date(date).getTime();

  var mistiming = Math.round(new Date() / 1000) - timestamp/1000;
  var arrr = ['年', '个月', '星期', '天', '小时', '分钟', '秒'];
  var arrn = [31536000, 2592000, 604800, 86400, 3600, 60, 1];
  for (var i = 6; i >= 0; i--) {
    if ((i==0 || mistiming < arrn[i-1]) && mistiming >= arrn[i]) {
      var inm = Math.floor(mistiming / arrn[i]);
      // console.log(inm + arrr[i] + '前')
      return inm + arrr[i] + '前'
    }
  }
}

module.exports = {
  // getBeforeDate: getBeforeDate,
  pastTime: pastTime,
  formatTime: formatTime,
  buttonClicked: buttonClicked
}
