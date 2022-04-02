class BarChart{
  static drawBar(
    ctx, 
    x, 
    y, 
    width,
    height, 
    color, 
  ){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fill();
  }

  static bar(width, height, padding, data, bold){
    let len = data.length;
    let maxValue = 0;
    data.forEach(({ value }) => {
      if(value > maxValue)maxValue = value;
    });
    let pad = 0.9;
    if(padding != undefined){
      pad = padding;
    }
    let x1 = (width * (1 - pad)) / 2;
    let w = width * pad;
    let y = (height * (1 - pad)) / 2;
    let h = height * pad;
    let xs = w / (len * 2 + 1);
    x1 -= xs;
    let bd = 0.5;
    if(bold != undefined)bd = bold;
    let nd = data.map((dt, ii)=>{
      x1 += 2 * xs;
      return Object.assign({}, dt, {
        x: x1 - bd * xs, 
        y: y,
        width: xs + bd * xs, 
        height: h * (dt.value / maxValue), 
        color: dt.color, 
      });
    });
    return nd;
  }

  constructor(canvas, options){
    this.canvas = canvas;
    this.options = options;
    this.ctx = null;

    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d');
      this.draw();
    } else {
      // canvas-unsupported code here
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let { data, padding, animationSpeed } = this.options;
    data = BarChart.bar(this.canvas.width , this.canvas.height, padding, data, this.options.bold);
    let x = 20;
    data.forEach(dt => {
      this.animateDraw(
        dt.x,
        dt.y,
        dt.width,
        dt.height,
        dt.color, 
        0,
        100 * (animationSpeed || 1),
      );

      x += 20;
    });
  }

  animateDraw(
    x, 
    y, 
    width,
    height, 
    color, 
    pct, 
    pctMax, 
  ){
    BarChart.drawBar(
      this.ctx, 
      x, 
      y, 
      width,
      (height * pct) / pctMax,
      color, 
    );
    if (pct < pctMax){
      requestAnimationFrame(() =>
        this.animateDraw(
          x, 
          y, 
          width, 
          height, 
          color, 
          pct + 1,
          pctMax,
        ),
      )
    }
  }
}


class DonutChart {
  static drawPieSlice(
    ctx,
    centerX,
    centerY,
    radius,
    startAngle,
    endAngle,
    holeSize,
    color,
  ) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.arc(centerX, centerY, radius * holeSize, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();
  }

  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options;
    this.ctx = null;

    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d');
      this.sortData();
      this.draw();
    } else {
      // canvas-unsupported code here
    }
  }

  sortData() {
    const { data } = this.options;

    data.sort((a, b) => {
      return b.value - a.value;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const { data, holeSize, animationSpeed } = this.options;

    let totalValue = 0;
    data.forEach(({ value }) => {
      totalValue += value;
    });

    let startAngle = Math.PI * 1.5;
    data.forEach(({ value, color }) => {
      const sliceAngle = (2 * Math.PI * value) / totalValue;
      this.animateDraw(
        startAngle,
        sliceAngle,
        holeSize || 0,
        color,
        0,
        100 * (animationSpeed || 1),
      );

      startAngle += sliceAngle;
    });
  }

  animateDraw(startAngle, sliceAngle, holeSize, color, pct, pctMax) {
    DonutChart.drawPieSlice(
      this.ctx,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.min(this.canvas.width / 2, this.canvas.height / 2),
      startAngle,
      startAngle + (sliceAngle * pct) / pctMax,
      holeSize,
      color,
    );

    if (pct < pctMax)
      requestAnimationFrame(() =>
        this.animateDraw(
          startAngle,
          sliceAngle,
          holeSize,
          color,
          pct + 1,
          pctMax,
        ),
      );
  }
}
