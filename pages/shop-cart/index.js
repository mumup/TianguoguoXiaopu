//index.js
var app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    notLogin: false,
    goodsList: {
      saveHidden: true,
      totalPrice: 0,
      allSelect: true,
      noSelect: false,
      list: []
    },
    shopDeliveryPrice: [],
    delBtnWidth: 120 //删除按钮宽度单位（rpx）
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function(w) {
    var real = 0
    try {
      var res = wx.getSystemInfoSync().windowWidth
      var scale = 750 / 2 / (w / 2) //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale)
      return real
    } catch (e) {
      return false
      // Do something when catch error
    }
  },
  initEleWidth: function() {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth)
    this.setData({
      delBtnWidth: delBtnWidth
    })
  },
  onLoad: function() {
    this.initEleWidth()
    this.getDeliveryPrice()
  },
  onShow: function() {
    util
      .checkHasLogined()
      .then(() => {
        this.setData({
          notLogin: false
        })
      })
      .catch(() => {
        util.loginOut()
        this.setData({
          notLogin: true
        })
      })
    var shopList = []
    // 获取购物车数据
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo')
    if (shopCarInfoMem && shopCarInfoMem.shopList) {
      shopList = shopCarInfoMem.shopList
    }
    this.data.goodsList.list = shopList
    this.setGoodsList(
      this.getSaveHide(),
      this.totalPrice(),
      this.allSelect(),
      this.noSelect(),
      shopList
    )
  },
  toIndexPage: function() {
    wx.switchTab({
      url: '/pages/classification/index'
    })
  },

  touchS: function(e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      })
    }
  },
  touchM: function(e) {
    var index = e.currentTarget.dataset.index
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX
      var disX = this.data.startX - moveX
      var delBtnWidth = this.data.delBtnWidth
      var left = ''
      if (disX == 0 || disX < 10) {
        //如果移动距离小于等于0，container位置不变
        left = 'margin-left:0px'
      } else if (disX > 10) {
        //移动距离大于0，container left值等于手指移动距离
        left = 'margin-left:-' + disX + 'px'
        if (disX >= delBtnWidth) {
          left = 'left:-' + delBtnWidth + 'px'
        }
      }
      var list = this.data.goodsList.list
      if (index != '' && index != null) {
        list[parseInt(index)].left = left
        this.setGoodsList(
          this.getSaveHide(),
          this.totalPrice(),
          this.allSelect(),
          this.noSelect(),
          list
        )
      }
    }
  },
  touchE: function(e) {
    var index = e.currentTarget.dataset.index
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX
      var disX = this.data.startX - endX
      var delBtnWidth = this.data.delBtnWidth
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left =
        disX > delBtnWidth
          ? 'margin-left:-' + delBtnWidth + 'px'
          : 'margin-left:0px'
      var list = this.data.goodsList.list
      if (index !== '' && index != null) {
        list[parseInt(index)].left = left
        this.setGoodsList(
          this.getSaveHide(),
          this.totalPrice(),
          this.allSelect(),
          this.noSelect(),
          list
        )
      }
    }
  },
  delItem: function(e) {
    var index = e.currentTarget.dataset.index
    var list = this.data.goodsList.list
    list.splice(index, 1)
    this.setGoodsList(
      this.getSaveHide(),
      this.totalPrice(),
      this.allSelect(),
      this.noSelect(),
      list
    )
  },
  selectTap: function(e) {
    var index = e.currentTarget.dataset.index
    var list = this.data.goodsList.list
    if (index !== '' && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active
      this.setGoodsList(
        this.getSaveHide(),
        this.totalPrice(),
        this.allSelect(),
        this.noSelect(),
        list
      )
    }
  },
  totalPrice: function() {
    var list = this.data.goodsList.list
    var total = 0
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.number
      }
    }
    total = parseFloat(total.toFixed(2)) //js浮点计算bug，取两位小数精度
    return total
  },
  allSelect: function() {
    var list = this.data.goodsList.list
    var allSelect = false
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      if (curItem.active) {
        allSelect = true
      } else {
        allSelect = false
        break
      }
    }
    return allSelect
  },
  noSelect: function() {
    var list = this.data.goodsList.list
    var noSelect = 0
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      if (!curItem.active) {
        noSelect++
      }
    }
    if (noSelect == list.length) {
      return true
    } else {
      return false
    }
  },
  setGoodsList: function(saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        allSelect: allSelect,
        noSelect: noSelect,
        list: list
      }
    })
    var shopCarInfo = {}
    var tempNumber = 0
    shopCarInfo.shopList = list
    for (var i = 0; i < list.length; i++) {
      tempNumber = tempNumber + list[i].number
    }
    shopCarInfo.shopNum = tempNumber
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo
    })
  },
  bindAllSelect: function() {
    var currentAllSelect = this.data.goodsList.allSelect
    var list = this.data.goodsList.list
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i]
        curItem.active = false
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i]
        curItem.active = true
      }
    }

    this.setGoodsList(
      this.getSaveHide(),
      this.totalPrice(),
      !currentAllSelect,
      this.noSelect(),
      list
    )
  },
  setNumberInput: function(e) {
    // console.log('setNumberInput-->', e)
    var that = this
    var index = e.currentTarget.dataset.index
    var list = that.data.goodsList.list
    if (index !== '' && index != null) {
      // 添加判断当前商品购买数量是否超过当前商品可购买库存
      var carShopBean = list[parseInt(index)]
      var carShopBeanStores = 0
      wx.request({
        url:
          'https://api.it120.cc/' +
          app.globalData.subDomain +
          '/shop/goods/detail',
        data: {
          id: carShopBean.goodsId
        },
        success: function(res) {
          carShopBeanStores = res.data.data.basicInfo.stores
          // console.log(
          //   ' currnet good id and stores is :',
          //   carShopBean.goodsId,
          //   carShopBeanStores
          // )
          if (parseInt(e.detail.value) < carShopBeanStores) {
            list[parseInt(index)].number = parseInt(e.detail.value)
            that.setGoodsList(
              that.getSaveHide(),
              that.totalPrice(),
              that.allSelect(),
              that.noSelect(),
              list
            )
          } else {
            list[parseInt(index)].number = carShopBeanStores
            that.setGoodsList(
              that.getSaveHide(),
              that.totalPrice(),
              that.allSelect(),
              that.noSelect(),
              list
            )
          }
          that.setData({
            curTouchGoodStores: carShopBeanStores
          })
        }
      })
    }
  },
  jiaBtnTap: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var list = that.data.goodsList.list
    if (index !== '' && index != null) {
      // 添加判断当前商品购买数量是否超过当前商品可购买库存
      var carShopBean = list[parseInt(index)]
      var carShopBeanStores = 0
      wx.showLoading({
        mask: true
      })
      wx.request({
        url:
          'https://api.it120.cc/' +
          app.globalData.subDomain +
          '/shop/goods/detail',
        data: {
          id: carShopBean.goodsId
        },
        success: function(res) {
          if(!(res.data && res.data.data && res.data.data.basicInfo)) {
            // 商品不存在
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 不存在，请重新购买',
              showCancel: false,
              success (res) {
                if (res.confirm) {
                  that.delItemByGoosId(carShopBean.goodsId)
                }
              }
            })
            return;
          }
          carShopBeanStores = res.data.data.basicInfo.stores
          // console.log(
          //   ' currnet good id and stores is :',
          //   carShopBean.goodsId,
          //   carShopBeanStores
          // )
          if (list[parseInt(index)].number < carShopBeanStores) {
            list[parseInt(index)].number++
            that.setGoodsList(
              that.getSaveHide(),
              that.totalPrice(),
              that.allSelect(),
              that.noSelect(),
              list
            )
          } else {
            list[parseInt(index)].number = carShopBeanStores
            that.setGoodsList(
              that.getSaveHide(),
              that.totalPrice(),
              that.allSelect(),
              that.noSelect(),
              list
            )
          }
          that.setData({
            curTouchGoodStores: carShopBeanStores
          })
        },
        complete: function(){
          wx.hideLoading()
        }
      })
    }
  },
  jianBtnTap: function(e) {
    var index = e.currentTarget.dataset.index
    var list = this.data.goodsList.list
    if (index !== '' && index != null) {
      if (list[parseInt(index)].number > 1) {
        list[parseInt(index)].number--
        this.setGoodsList(
          this.getSaveHide(),
          this.totalPrice(),
          this.allSelect(),
          this.noSelect(),
          list
        )
      }
    }
  },
  editTap: function() {
    var list = this.data.goodsList.list
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      curItem.active = false
    }
    this.setGoodsList(
      !this.getSaveHide(),
      this.totalPrice(),
      this.allSelect(),
      this.noSelect(),
      list
    )
  },
  saveTap: function() {
    var list = this.data.goodsList.list
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      curItem.active = true
    }
    this.setGoodsList(
      !this.getSaveHide(),
      this.totalPrice(),
      this.allSelect(),
      this.noSelect(),
      list
    )
  },
  getSaveHide: function() {
    var saveHidden = this.data.goodsList.saveHidden
    return saveHidden
  },
  deleteSelected: function() {
    var list = this.data.goodsList.list
    /*
    for(let i = 0 ; i < list.length ; i++){
       let curItem = list[i];
       if(curItem.active){
         list.splice(i,1);
       }
    }
     */
    // above codes that remove elements in a for statement may change the length of list dynamically
    list = list.filter(function(curGoods) {
      return !curGoods.active
    })
    this.setGoodsList(
      this.getSaveHide(),
      this.totalPrice(),
      this.allSelect(),
      this.noSelect(),
      list
    )
  },
  requestData: function(url, data) {
    return new Promise(function(resolve, reject) {
      wx.request({
        url: url,
        data: data,
        success: function(res) {
          resolve(res)
        },
        fail: function(err) {
          reject(false)
        }
      })
    })
  },
  delItemByGoosId(id) {
    var list = this.data.goodsList.list
    let find = list.findIndex(item => item.goodsId === id)
    if (find !== -1) {
      this.delItem({
        currentTarget: {
          dataset: {
            index: find
          }
        }
      })
    }
  },
  async toPayOrder() {
    if (this.data.notLogin) {
      wx.navigateTo({
        url: '/pages/authorize/index'
      })
      return
    }
    if (this.data.goodsList.totalPrice < this.data.shopDeliveryPrice) {
      wx.showModal({
        title: '未达到起送价',
        content: '请您再选一些吧！',
        showCancel: false
      })
    } else {
      wx.showLoading({
        mask: true
      })
      var that = this
      if (this.data.goodsList.noSelect) {
        wx.hideLoading()
        return
      }
      // 重新计算价格，判断库存
      var shopList = []
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo')
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active
        })
      }
      if (shopList.length == 0) {
        wx.hideLoading()
        return
      }
      var isFail = false
      var doneNumber = 0
      var needDoneNUmber = shopList.length
      for (let i = 0; i < shopList.length; i++) {
        if (isFail) {
          wx.hideLoading();
          break;
        }
        let carShopBean = shopList[i]
        let api = ''
        let apiData = {}
        // 获取价格和库存
        if (
          !carShopBean.propertyChildIds ||
          carShopBean.propertyChildIds == ''
        ) {
          api = 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail'
          apiData = {
            id: carShopBean.goodsId
          }
        } else {
          api = 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/price'
          apiData = {
            goodsId: carShopBean.goodsId,
            propertyChildIds: carShopBean.propertyChildIds
          }
        }
        try {
          var resData = await this.requestData(api,apiData)
          doneNumber++
          if (resData.data.code === 404 && resData.data.msg === '暂无数据') {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 不存在，请重新购买',
              showCancel: false,
              success (res) {
                if (res.confirm) {
                  that.delItemByGoosId(carShopBean.goodsId)
                }
              }
            })
            isFail = true
            wx.hideLoading()
            return
          }
          if (resData.data.data.properties) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 商品已失效，请重新购买',
              showCancel: false,
              success (res) {
                if (res.confirm) {
                  that.delItemByGoosId(carShopBean.goodsId)
                }
              }
            })
            isFail = true
            wx.hideLoading()
            return
          }
          if (resData.data.data && resData.data.data.basicInfo && resData.data.data.basicInfo.stores < carShopBean.number || (resData.data.data && resData.data.data.stores < carShopBean.number)) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 库存不足，请重新购买',
              showCancel: false
            })
            isFail = true
            wx.hideLoading()
            return
          }
          if (resData.data.data && resData.data.data.basicInfo && resData.data.data.basicInfo.minPrice != carShopBean.price || (resData.data.data && resData.data.data.price != carShopBean.price)) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 价格有调整，请重新购买',
              showCancel: false,
              success (res) {
                if (res.confirm) {
                  that.delItemByGoosId(carShopBean.goodsId)
                }
              }
            })
            isFail = true
            wx.hideLoading()
            return
          }
          if (needDoneNUmber == doneNumber) {
            that.navigateToPayOrder()
          }
        } catch (err) {
          isFail = true
          wx.hideLoading()
        }
      }
    }
  },
  navigateToPayOrder: function() {
    wx.hideLoading()
    wx.navigateTo({
      url: '/pages/to-pay-order/index'
    })
  },
  getDeliveryPrice: function() {
    var that = this
    //  获取关于我们Title
    wx.request({
      url:
        'https://api.it120.cc/' +
        app.globalData.subDomain +
        '/config/get-value',
      data: {
        key: 'shopDeliveryPrice'
      },
      success: function(res) {
        if (res.data.code == 0) {
          var shopDeliveryPrice = parseFloat(
            parseFloat(res.data.data.value).toFixed(2)
          )
          that.setData({
            shopDeliveryPrice: shopDeliveryPrice
          })
          // console.log('配送起步价：', shopDeliveryPrice, res.data.data.value)
        }
      }
    })
  }
})
