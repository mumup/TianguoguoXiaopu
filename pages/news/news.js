var app = getApp();
var WxParse = require('../../templates/wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    news: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/cms/news/detail',
      data: {
        id: options.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            news: res.data.data
          });
          WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: `/pages/news/news?id=${options.id}`,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})