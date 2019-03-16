var Bmob = require('utils/bmob.js');
Bmob.initialize(
  "9a68cce6689ca69dcd286c4e4eba7d07", "a5e489144f78cfd52d57e71375bda36d");

App({
  onLaunch: function () {
    var currentUser = Bmob.User.current();//当前用户
    // this.globalData.userInfo = currentUser.userInfo
    console.log(currentUser)
  },
  
  globalData: {
    userInfo: null
  }
})