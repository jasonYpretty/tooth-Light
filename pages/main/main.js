const app = getApp()

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
Page({
  data: {
    currentIndex: 0,
    "firstList": [{}],
    "secondList": [{}],
    "thirdList": [{}],
    deviceId: null,
    sliderCCT: 3500,
    sliderB: 1,
    sliderH: 0,
    sliderS: 100,
    sliderL: 50,
    showColorPicker1: true,
    LOADING1: {
      sliderRGBR: 255,
      sliderRGBG: 255,
      sliderRGBB: 255,
      Hue2: 0,
      Saturation2: 0,
      Lightness2: 100
    },
    colorData1: {
      //基础色相(色盘右上顶点的颜色)
      hueData: {
        colorStopRed: 255,
        colorStopGreen: 0,
        colorStopBlue: 0,
        colorStopHue: 0,
        colorStopSaturation: 100,
        colorStopLightness: 50
      },
      //选择点的信息
      pickerData: {
        x: 0,
        y: 0,
        red: 255,
        green: 255,
        blue: 255,
        Hue: 0,
        Saturation: 0,
        Lightness: 100,
        hex: '#ffffff'
      },
      //色相控制条位置
      barZ: 0
    },
    rpxRatio: 1 //单位rpx实际像素
  },
  onLoad: function () {
    this.setData({
      deviceId: app.globalData.device.deviceId
    })
    console.log('main页面:' + app.globalData.device.deviceId)
    // getBLEDeviceServices(deviceId)
    let _this = this
    wx.getSystemInfo({
      success(res) {
        _this.setData({
          rpxRatio: res.screenWidth / 750
        })
      }
    })
  },
  closeConnection() {
    wx.navigateBack({
      url: '../index/index',
    })
  },
  //bluetooth
  onChangeColor(e) {
    const index = e.target.dataset.id
    this.setData({
      [`colorData${index}`]: e.detail.colorData
    })
  },
  toggleColorPicker(e) {
    const index = e.currentTarget.dataset.id
    this.setData({
      [`showColorPicker${index}`]: !this.data[`showColorPicker${index}`]
    })
  },
  closeColorPicker() {
    this.setData({
      showColorPicker1: true
    })
  },
  onChangeCCT(e) {
    this.setData({
      sliderCCT: e.detail.value
    })
  },
  onChangeLD(e) {
    this.setData({
      sliderB: e.detail.value
    })
  },
  CopyLink(e) {
    wx.setClipboardData({
      data: "red:" + this.data.colorData1.pickerData.red + " green:" + this.data.colorData1.pickerData.green + " blue:" + this.data.colorData1.pickerData.blue,
      success: res => {
        wx.showToast({
          title: '已复制',
          duration: 1000,
        })
      }
    })
    this.hideModal()
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  //swiper切换时会调用

  tabChange: function (e) {
    var that = this;
    that.setData({
      currentIndex: e.detail.current
    });
  },
  tabSelect(e) {
    this.setData({
      currentIndex: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
    console.log(this.data.TabCur)
  },
  onChangeR(e) {
    this.data.LOADING1.sliderRGBR = e.detail.value
    const {
      LOADING1
    } = this.data
    this._rgbToHSB(this.data.LOADING1.sliderRGBR, this.data.LOADING1.sliderRGBG, this.data.LOADING1.sliderRGBB)
  },
  onChangeG(e) {
    this.data.LOADING1.sliderRGBG = e.detail.value
    const {
      LOADING1
    } = this.data
    this._rgbToHSB(this.data.LOADING1.sliderRGBR, this.data.LOADING1.sliderRGBG, this.data.LOADING1.sliderRGBB)
  },
  onChangeB(e) {
    this.data.LOADING1.sliderRGBB = e.detail.value
    const {
      LOADING1
    } = this.data
    this._rgbToHSB(this.data.LOADING1.sliderRGBR, this.data.LOADING1.sliderRGBG, this.data.LOADING1.sliderRGBB)
  },
  _rgbToHSB(r, g, b) {
    let HSB = {
      H: 0,
      S: 0,
      B: 100
    }
    var Cmax = 0,
      Cmin = 0,
      H = 0,
      S = 0,
      B = 0,
      MARK
      console.log(r,g,b)
    if (r >= g) {
      if (r >= b) {
        //MAX=R
        Cmax = r / 255
        if (b >= g) {
          Cmin = g / 255
        } else {
          Cmin = b / 255
        }
        MARK = Cmax - Cmin
        let H1 = (g / 255 - b / 255)
        if (H1 >= 0) {
          H = 60 * (H1 % 6)
        } else {
          H = 60 * (H1 % 6) + 360
        }
        //MAX=R end
      } else {
        //MAX=B
        Cmax = b / 255
        Cmin = g / 255
        MARK = Cmax - Cmin
        H = 60 * ((r / 255 - g / 255) / MARK + 4)
        //MAX=B end
      }
    } else {
      if (g >= b) {
        //MAX=G
        Cmax = g / 255
        if (b >= r) {
          Cmin = r / 255
        } else {
          Cmin = b / 255
        }
        MARK = Cmax - Cmin
        H = 60 * ((b / 255 - r / 255) / MARK + 2)
        //MAX=G end
      } else {
        //MAX=B
        Cmax = b / 255
        Cmin = r / 255
        MARK = Cmax - Cmin
        H = 60 * ((r / 255 - g / 255) / MARK + 4)
        //MAX=B end
      }
    }
    B = Cmax
    var B2 = 2 * B - 1
    if (B2 < 0) B2 = -B2

    MARK = Cmax - Cmin
    if (MARK == 0) {
      S = 0
      H = 0
      // B = (Cmax + Cmin) / 2
    } else {
      S = 1 - Cmin / Cmax
    } //求S
    // console.log(Cmax, Cmin, 'H:' + H, 'S:' + S, 'B:' + B)
    HSB.H = H.toFixed(0),
      HSB.S = (S * 100).toFixed(0)
    HSB.B = (B * 100).toFixed(0)
    //console.log("HUE" + pickerData.Hue)
    //换算结束
    const {
      LOADING1
    } = this.data
    LOADING1.Hue2 = HSB.H
    LOADING1.Saturation2 = HSB.S
    LOADING1.Lightness2 = HSB.B
    this.setData({
      LOADING1
    })
    return HSB
  },
})