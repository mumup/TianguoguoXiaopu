const app = getApp()
const util = require('../../../utils/util.js');

Page({
  data: {
    aboutUsTitle: '',
    aboutUsContent: '',
    servicePhoneNumber: '',
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    iconSize: 45,
    iconColor: '#999999',
    notLogin: true
  },
  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading()
    that.onShow()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onLoad() {
    let that = this;
    that.setData({
      version: app.globalData.version,
      background_color: app.globalData.globalBGColor,
      bgRed: app.globalData.bgRed,
      bgGreen: app.globalData.bgGreen,
      bgBlue: app.globalData.bgBlue
    })
  },
  onShow() {
    var that = this;
    util.checkHasLogined().then(() => {
      that.setData({
        notLogin: false
      })
      var userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        that.setData({
          userInfo: userInfo,
        })
      }
      that.getUserApiInfo();
      that.getUserAmount();
      that.checkScoreSign();
    }).catch(() => {
      util.loginOut();
      that.setData({
        notLogin: true
      })
    })
    that.getAboutUs();
    that.getservicePhoneNumber();
  },
  aboutUs: function () {
    var that = this
    wx.showModal({
      title: that.data.aboutUsTitle,
      content: that.data.aboutUsContent,
      showCancel: false
    })
  },
  makePhoneCall: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.servicePhoneNumber
    })
  },
  getPhoneNumber: function (e) {
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      console.log(e.detail.errMsg)
      wx.showModal({
        title: '提示',
        content: '无法获取手机号码',
        showCancel: false
      })
      return;
    }
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxapp/bindMobile',
      data: {
        token: wx.getStorageSync('token'),
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          })
          that.getUserApiInfo();
        } else {
          wx.showModal({
            title: '提示',
            content: '绑定失败',
            showCancel: false
          })
        }
      }
    })
  },
  getUserApiInfo: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/detail',
      data: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            apiUserInfoMap: res.data.data,
            userMobile: res.data.data.base.mobile || ''
          });
        }
      }
    })

  },
  getUserAmount: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/amount',
      data: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            balance: res.data.data.balance,
            freeze: res.data.data.freeze,
            score: res.data.data.score
          });
        }
      }
    })

  },
  getAboutUs: function () {
    var that = this
    //  获取关于我们Title
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'aboutUsTitle'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            aboutUsTitle: res.data.data.value
          })
        }
      }
    })
    //  获取关于我们内容
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'aboutUsContent'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            aboutUsContent: res.data.data.value
          })
        }
      }
    })
  },
  getservicePhoneNumber: function () {
    var that = this
    //  获取客服电话
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'servicePhoneNumber'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            servicePhoneNumber: res.data.data.value
          })
        }
      }
    })
  },
  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/score/today-signed',
      data: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            score_sign_continuous: res.data.data.continuous
          });
        }
      }
    })
  },
  scoresign: function () {
    var that = this;
    this.data.notLogin ?  wx.navigateTo({
      url: "/pages/authorize/index"
    }) :
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/score/sign',
      data: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getUserAmount();
          that.checkScoreSign();
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  loginOut: function () {
    const that = this;
    wx.showModal({
      content: '是否退出登录？',
      success (res) {
        if (res.confirm) {
          util.loginOut();
          that.setData({
            userInfo: null,
            notLogin: true,
            balance: 0,
            freeze: 0,
            score: 0,
            score_sign_continuous: 0
          })
        }
      }
    })
  },
  relogin: function () {
    wx.navigateTo({
     url: "/pages/authorize/index"
    })
  },
  recharge: function () {
    wx.navigateTo({
      url: this.data.notLogin ? "/pages/authorize/index" : "/pages/recharge/index"
    })
  },
  withdraw: function () {
    wx.navigateTo({
      url: this.data.notLogin ? "/pages/authorize/index" : "/pages/withdraw/index"
    })
  },
  goPage(e) {
    var url = this.data.notLogin ? "/pages/authorize/index" : e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  }
})