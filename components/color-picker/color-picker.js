Component({
  properties: {
    //单位rpx实际像素
    rpxRatio: {
      type: Number,
      value: 1
    },
    colorData: {
      type: Object,
      value: {}
    }
  },
  data: {
    //基础色相(色盘右上顶点的颜色)
    hueData: {
      colorStopRed: 255,
      colorStopGreen: 0,
      colorStopBlue: 0,
      colorStopHue: 0,
      colorStopSaturation: 100,
      colorStopLightness: 50
    },
    //选择点的颜色
    pickerData: {
      x: 0,
      y: 480,
      red: 255,
      green: 255,
      blue: 255,
      Hue: 0,
      Saturation: 0,
      Lightness: 100,
      hex: '#ffffff'
    },
    //色相控制条位置
    barZ: 0,
    top: 0, //组件的位置
    left: 0,
    scrollTop: 0, //滚动位置
    scrollLeft: 0,
    timer: 0,
  },
  lifetimes: {
    attached() {
      this.setData({
        hueData: this.data.colorData.hueData,
        pickerData: this.data.colorData.pickerData,
        barZ: this.data.colorData.barZ
      })

    },
    ready() {
      const _this = this
      const query = wx.createSelectorQuery().in(this)
      query.select('#wrapper').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(res => {
        _this.setData({
          top: res[0].top,
          left: res[0].left,
          scrollTop: res[1].scrollTop,
          scrollLeft: res[1].scrollLeft
        })
      })
    }
  },


  methods: {
    //选中颜色
    _chooseColor(e) {
      clearTimeout(this.data.timer)
      let x = (e.changedTouches[0].pageX - this.data.left - this.data.scrollLeft) / this.data.rpxRatio
      let y = (e.changedTouches[0].pageY - this.data.top - this.data.scrollTop) / this.data.rpxRatio
      x = x > 480 ? 480 : x
      y = y > 480 ? 480 : y
      x = x < 0 ? 0 : x
      y = y < 0 ? 0 : y
      const {
        pickerData
      } = this.data
      pickerData.x = x
      pickerData.y = y
      console.log("choose:x:" + x + ";y:" + y)
      this.setData({
        pickerData,
        time: setTimeout(() => {
          this._changeColor(x, y)
        }, 10) //延时
      })
    },
    _chooseColorS(x,y) {
      x = x > 480 ? 480 : x
      y = y > 480 ? 480 : y
      x = x < 0 ? 0 : x
      y = y < 0 ? 0 : y
      const {
        pickerData
      } = this.data
      pickerData.x = x
      pickerData.y = y
      console.log("choose:x:" + x + ";y:" + y)
    },
    //拖动色相bar
    _changeBar(e) {
      let z = (e.changedTouches[0].pageY - this.data.top - this.data.scrollTop) / this.data.rpxRatio
      z = z > 490 ? 490 : z
      z = z < 0 ? 0 : z
      this.setData({
        barZ: z
      })
      //console.log("色相条：" + e.changedTouches[0].pageY)
      this._changeHue(z)
    },
    //改变颜色
    _changeColor(x, y) {
      //获取色相（色盘最右上角的颜色）
      const sRed = this.data.hueData.colorStopRed
      const sGreen = this.data.hueData.colorStopGreen
      const sBlue = this.data.hueData.colorStopBlue
      //选择的颜色
      //实际上这里是先算出假设y等于0时(不考虑Y轴)的颜色，后面需要再减去y*比例的颜色值
      let [pRed, pGreen, pBlue] = [this.data.pickerData.red, this.data.pickerData.green, this.data.pickerData.blue]
      //首先计算X轴
      if (sRed === 255) {
        //移动1单位需要减少多少颜色值
        const greenRatioX = (255 - sGreen) / 480
        const blueRatioX = (255 - sBlue) / 480
        const greenValueX = 255 - x * greenRatioX
        const blueValueX = 255 - x * blueRatioX
        pRed = 255
        pGreen = Math.round(greenValueX > sGreen ? greenValueX : sGreen)
        pBlue = Math.round(blueValueX > sBlue ? blueValueX : sBlue)
      }
      if (sGreen === 255) {
        const redRatioX = (255 - sRed) / 480
        const blueRatioX = (255 - sBlue) / 480
        const redValueX = 255 - x * redRatioX
        const blueValueX = 255 - x * blueRatioX
        pRed = Math.round(redValueX > sRed ? redValueX : sRed)
        pGreen = 255
        pBlue = Math.round(blueValueX > sBlue ? blueValueX : sBlue)
      }
      if (sBlue === 255) {
        const redRatioX = (255 - sRed) / 480
        const greenRatioX = (255 - sGreen) / 480
        const redValueX = 255 - x * redRatioX
        const greenValueX = 255 - x * greenRatioX
        pRed = Math.round(redValueX > sRed ? redValueX : sRed)
        pGreen = Math.round(greenValueX > sGreen ? greenValueX : sGreen)
        pBlue = 255
      }

      //考虑Y轴，减去y*比例的颜色值，得到最终颜色
      const redRatioY = pRed / 480
      const greenRatioY = pGreen / 480
      const blueRatioY = pBlue / 480

      const redValueY = y * redRatioY
      const greenValueY = y * greenRatioY
      const blueValueY = y * blueRatioY
      const hex = this._rgbToHex(pRed - redValueY, pGreen - greenValueY, pBlue - blueValueY)
      const {
        pickerData
      } = this.data
      pickerData.red = Math.round(pRed - redValueY)
      pickerData.green = Math.round(pGreen - greenValueY)
      pickerData.blue = Math.round(pBlue - blueValueY)
      pickerData.hex = hex
      pickerData.x = x
      console.log("选点的改变x:" + x + ";y:" + y)
      //换算HSB
      const HSB= this._rgbToHSB(pickerData.red, pickerData.green, pickerData.blue)
      //console.log(HSB.H)
      pickerData.Hue = HSB.H
      pickerData.Saturation = HSB.S
      pickerData.Lightness = HSB.B
      this.setData({
        pickerData
      })
      this.triggerEvent('changecolor', {
        colorData: this.data
      })
    },
    //改变色相
    _changeHue(z) {
      //根据色相bar的长度(490)计算出每拖动0.32距离就改变一次色相（R或G或B的值增减1）
      //色相的变化一共分为六个阶段,每次拖动81.67距离就完成一个阶段
      const {
        hueData
      } = this.data
      if (z < 81.67) {
        const value = z / .32 > 255 ? 255 : z / .32
        hueData.colorStopRed = 255
        hueData.colorStopGreen = Math.round(value)
        hueData.colorStopBlue = 0
      }
      if (z >= 81.67 && z < 163.34) {
        const value = (z - 81.67) / .32 > 255 ? 255 : (z - 81.67) / .32
        hueData.colorStopRed = 255 - Math.round(value)
        hueData.colorStopGreen = 255
        hueData.colorStopBlue = 0
      }
      if (z >= 163.34 && z < 245.01) {
        const value = (z - 163.34) / .32 > 255 ? 255 : (z - 163.34) / .32
        hueData.colorStopRed = 0
        hueData.colorStopGreen = 255
        hueData.colorStopBlue = Math.round(value)
      }
      if (z >= 245.01 && z < 326.68) {
        const value = (z - 245.01) / .32 > 255 ? 255 : (z - 245.01) / .32
        hueData.colorStopRed = 0
        hueData.colorStopGreen = 255 - Math.round(value)
        hueData.colorStopBlue = 255
      }
      if (z >= 326.68 && z < 408.35) {
        const value = (z - 326.68) / .32 > 255 ? 255 : (z - 326.68) / .32
        hueData.colorStopRed = Math.round(value)
        hueData.colorStopGreen = 0
        hueData.colorStopBlue = 255
      }
      if (z >= 408.35) {
        const value = (z - 408.35) / .32 > 255 ? 255 : (z - 408.35) / .32
        hueData.colorStopRed = 255
        hueData.colorStopGreen = 0
        hueData.colorStopBlue = 255 - Math.round(value)
      }
      this.setData({
        hueData
      })
      //改变完色相需要再次改变选择的颜色
      this._changeColor(this.data.pickerData.x, this.data.pickerData.y)
      console.log("色相拖动的改变z:" + z)
    },
    onChangeH(e) {
      // console.log("Hbianhua:" + this.data.pickerData.Hue)
      this.data.pickerData.Hue = e.detail.value
      const {
        pickerData,
        hueData
      } = this.data
      const rgb = this._HSBTorgb(this.data.pickerData.Hue, this.data.pickerData.Saturation / 100, this.data.pickerData.Lightness / 100)
      //色相反映到色板中
      var zh = this.data.pickerData.Hue*480/360
      if (zh < 81.67) {
        const value = zh / .32 > 255 ? 255 : zh / .32
        hueData.colorStopRed = 255
        hueData.colorStopGreen = Math.round(value)
        hueData.colorStopBlue = 0
      }
      if (zh >= 81.67 && zh < 163.34) {
        const value = (zh - 81.67) / .32 > 255 ? 255 : (zh - 81.67) / .32
        hueData.colorStopRed = 255 - Math.round(value)
        hueData.colorStopGreen = 255
        hueData.colorStopBlue = 0
      }
      if (zh >= 163.34 && zh < 245.01) {
        const value = (zh - 163.34) / .32 > 255 ? 255 : (zh - 163.34) / .32
        hueData.colorStopRed = 0
        hueData.colorStopGreen = 255
        hueData.colorStopBlue = Math.round(value)
      }
      if (zh >= 245.01 && zh < 326.68) {
        const value = (zh - 245.01) / .32 > 255 ? 255 : (zh - 245.01) / .32
        hueData.colorStopRed = 0
        hueData.colorStopGreen = 255 - Math.round(value)
        hueData.colorStopBlue = 255
      }
      if (zh >= 326.68 && zh < 408.35) {
        const value = (zh - 326.68) / .32 > 255 ? 255 : (zh - 326.68) / .32
        hueData.colorStopRed = Math.round(value)
        hueData.colorStopGreen = 0
        hueData.colorStopBlue = 255
      }
      if (zh >= 408.35) {
        const value = (zh - 408.35) / .32 > 255 ? 255 : (zh - 408.35) / .32
        hueData.colorStopRed = 255
        hueData.colorStopGreen = 0
        hueData.colorStopBlue = 255 - Math.round(value)
      }
      console.log(zh)
      this.setData({
        hueData
      })
      //end
      //console.log(rgb)
      pickerData.red = rgb.R
      pickerData.green = rgb.G
      pickerData.blue = rgb.B
      this.setData({
        pickerData
      })
      this.triggerEvent('changecolor', {
        colorData: this.data
      })
    },
    onChangeS(e) {
      // console.log("Hbianhua:" + this.data.pickerData.Hue)
      this.data.pickerData.Saturation = e.detail.value
      const {
        pickerData
      } = this.data
      const rgb = this._HSBTorgb(this.data.pickerData.Hue, this.data.pickerData.Saturation / 100, this.data.pickerData.Lightness / 100)
      // var x = this.data.pickerData.Saturation *4.8
      var x = this.data.pickerData.Saturation * 4.8
      var y = this.data.pickerData.y
      this._chooseColorS(x, y)
      pickerData.red = rgb.R
      pickerData.green = rgb.G
      pickerData.blue = rgb.B
      this.setData({
        pickerData
      })
      this.triggerEvent('changecolor', {
        colorData: this.data
      })      
    },
    onChangeB(e) {
      // console.log("Hbianhua:" + this.data.pickerData.Hue)
      this.data.pickerData.Lightness = e.detail.value
      const {
        pickerData
      } = this.data
      const rgb = this._HSBTorgb(this.data.pickerData.Hue, this.data.pickerData.Saturation / 100, this.data.pickerData.Lightness / 100)
      var x = this.data.pickerData.x
      var y = 480-this.data.pickerData.Lightness * 4.8
      this._chooseColorS(x, y)
      pickerData.red = rgb.R
      pickerData.green = rgb.G
      pickerData.blue = rgb.B
      this.triggerEvent('changecolor', {
        colorData: this.data
      })  
      this.setData({
        pickerData
      })
    },
//gogogo 20191108
    _rgbToHex(r, g, b) {
      //console.log("_rgbToHex" + r, g, b)
      let hex = ((r << 16) | (g << 8) | b).toString(16)
      if (hex.length < 6) {
        hex = `${'0'.repeat(6-hex.length)}${hex}`
      }
      if (hex == '0') {
        hex = '000000'
      }
      return `#${hex}`
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
        S = 1-Cmin/Cmax
      } //求S
      // console.log(Cmax, Cmin, 'H:' + H, 'S:' + S, 'B:' + B)
      HSB.H = H.toFixed(0),
      HSB.S = (S * 100).toFixed(0)
      HSB.B = (B * 100).toFixed(0)
      //console.log("HUE" + pickerData.Hue)
      //换算结束
      return HSB
    },
    _HSBTorgb(H, S, B) {
      var C = S * B
      var X1 = (H / 60) % 2 - 1
      if (X1 < 0) X1 = -X1
      var X = C * (1 - X1)
      var m = B - C
      var R1, G1, B1
      let rgb = {
        R: 255,
        G: 255,
        B: 255
      }
      if (H >= 0 && H < 60) {
        R1 = C, G1 = X, B1 = 0
      }
      if (H >= 60 && H < 120) {
        R1 = X, G1 = C, B1 = 0
      }
      if (H >= 120 && H < 180) {
        R1 = 0, G1 = C, B1 = X
      }
      if (H >= 180 && H < 240) {
        R1 = 0, G1 = X, B1 = C
      }
      if (H >= 240 && H < 300) {
        R1 = X, G1 = 0, B1 = C
      }
      if (H >= 300 && H <= 360) { //h=360TEST
        R1 = C, G1 = 0, B1 = X
      }
      rgb.R = ((R1 + m) * 255).toFixed(0)
      rgb.G = ((G1 + m) * 255).toFixed(0)
      rgb.B = ((B1 + m) * 255).toFixed(0)
      //沒有问题
      let zh = H * 490 / 360
      zh = zh > 490 ? 490 : zh
      zh = zh < 0 ? 0 : zh
      this.setData({
        barZ: zh
      })
      this.data.pickerData.red = rgb.R
      this.data.pickerData.green = rgb.G
      this.data.pickerData.blue = rgb.B
      let hex = this._rgbToHex(rgb.R, rgb.G, rgb.B)
      this.data.pickerData.hex = hex
      return rgb
    },
  }
})