import { generateGradientColor } from '@/services/utils';

export class LogoSquircle {
  smooth = 3;
  shift = 60;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  image?: HTMLImageElement;
  gradient: CanvasGradient;

  constructor({ canvas, color, image, shift }: {
    canvas: HTMLCanvasElement,
    image?: HTMLImageElement
    color?: string,
    shift?: number,
  }) {
    this.canvas = canvas;
    this.image = image;
    this.shift = shift ?? this.shift;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.sizeCanvas();
    this.gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    if (color) {
      this.gradient.addColorStop(0, color);
      this.gradient.addColorStop(1, generateGradientColor(color, this.shift));
    } else {
      const style = getComputedStyle(document.documentElement);
      this.gradient.addColorStop(0, style.getPropertyValue('--gradient-color-1'));
      this.gradient.addColorStop(1, style.getPropertyValue('--gradient-color-2'));
    }
  }

  shot() {
    this.clear();
    this.clipSquircle(0);
    this.drawBackground();
    this.drawLogo();
  }

  animate(currentTime: number) {
    this.clear();
    this.clipSquircle(currentTime);
    this.drawBackground();
    this.drawLogo();
  }

  drawBackground() {
    this.ctx.fillStyle = this.gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawLogo() {
    if (!this.image) {
      return;
    }
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
  }

  clipSquircle(currentTime: number = 0) {
    const breathAmplitude = Math.sin(currentTime / 1000) * 0.5;
    const smooth = this.smooth + breathAmplitude;

    let m = smooth;
    if (smooth > 100) m = 100;
    if (smooth < 0.00000000001) m = 0.00000000001;
    const r = this.canvas.width / 2;
    const w = this.canvas.width / 2;
    const h = this.canvas.height / 2;

    this.ctx.beginPath();

    for (let i = 0; i < (2*r+1); i++) {
      const x = (i-r) + w;
      const y = (Math.pow(Math.abs(Math.pow(r,m)-Math.pow(Math.abs(i-r),m)),1/m)) + h;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      }
      else {
        this.ctx.lineTo(x, y);
      }
    }

    for (let i = (2*r); i < (4*r+1); i++) {
      const x = (3*r-i) + w;
      const y = (-Math.pow(Math.abs(Math.pow(r,m)-Math.pow(Math.abs(3*r-i),m)),1/m)) + h;
      this.ctx.lineTo(x, y);
    }

    this.ctx.closePath();
    this.ctx.clip();
  }

  sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const canvasRect = getComputedStyle(this.canvas);
    this.canvas.width = Number(canvasRect.width.slice(0, -2)) * dpr;
    this.canvas.height = Number(canvasRect.height.slice(0, -2)) * dpr;
    this.ctx.scale(dpr, dpr);
  }

  clear() {
    this.ctx.reset();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
