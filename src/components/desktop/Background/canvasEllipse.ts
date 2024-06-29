import { vwToPx, vhToPx, Vector2 } from '@/services/utils';

interface Ellipse {
  pos: Vector2; // vw
  radius: number; // vw
  blur: number; // vw
  _pos: Vector2; // px
  _radius: number; // px
  _blur: number; // px
}

const getPointOnEllipse = (centerX: number, centerY: number, radius: number, angle: number) => { // angle in degrees
  const degrees = angle * Math.PI / 180;
  const x = centerX + radius * Math.cos(degrees);
  const y = centerY + radius * Math.sin(degrees);
  return { x, y };
};

const getOppositeAngle = (angle: number) => {
  return angle > 180 ? angle - 180 : angle + 180;
};

export class BgEllipse {
  angle = 240; // degrees

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  gradientColor1 = '';
  gradientColor2 = '';
  ellipse: Ellipse = {
    pos: new Vector2(),
    radius: 0,
    blur: 0,
    _pos: new Vector2(),
    _radius: 0,
    _blur: 0,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.sizeCanvas();
    this.sizeProps();
    this.updateColor();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  updateColor() {
    const style = getComputedStyle(document.documentElement);
    this.gradientColor1 = style.getPropertyValue('--gradient-color-1');
    this.gradientColor2 = style.getPropertyValue('--gradient-color-2');
  }

  setGradient(x1: number, y1: number, x2: number, y2: number) {
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, this.gradientColor1);
    gradient.addColorStop(1, this.gradientColor2);
    this.ctx.fillStyle = gradient;
  }

  setEllipse({ x, y, radius, blur }: { x: number, y: number, radius: number, blur: number }) {
    this.ellipse.pos.set(x, y);
    this.ellipse.radius = radius;
    this.ellipse.blur = blur;
    this.sizeProps();
  }

  animateEllipse(x: number, y: number, radius: number, time: number) {
    const startPos = this.ellipse._pos.copy();
    const targetPos = new Vector2(vwToPx(x), vhToPx(y));
    const totalDistance = Vector2.dist(startPos, targetPos);

    const startRadius = this.ellipse._radius;
    const targetRadius = vwToPx(radius);
    const totalRadius = targetRadius - startRadius;

    const direction = new Vector2(targetPos.x - startPos.x, targetPos.y - startPos.y);

    Vector2.normalize(direction, direction);

    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const elapsed = currentTime - startTime;

      if (elapsed < time) {
        const distanceCovered = (elapsed / time) * totalDistance;
        const step = new Vector2(direction.x, direction.y);
        Vector2.scale(step, direction, distanceCovered);

        const radiusCovered = (elapsed / time) * totalRadius;
        this.ellipse._radius = startRadius + radiusCovered * (targetRadius - startRadius > 0 ? 1 : -1);

        this.ellipse._pos.set(startPos.x + step.x, startPos.y + step.y);

        this.drawEllipse();
        requestAnimationFrame(animate.bind(this));
      } else {
        this.ellipse._pos.set(targetPos.x, targetPos.y);
        this.ellipse._radius = targetRadius;
        this.ellipse.pos.set(x, y);
        this.ellipse.radius = radius;
      }
    };

    requestAnimationFrame(animate.bind(this));
  }

  drawEllipse() {
    this.clear();
    // set gradient with ellipse position and radius
    const { x, y } = this.ellipse._pos;
    const { x: x1, y: y1 } = getPointOnEllipse(x, y, this.ellipse._radius, this.angle);
    const { x: x2, y: y2 } = getPointOnEllipse(x, y, this.ellipse._radius, getOppositeAngle(this.angle));
    this.setGradient(x1, y1, x2, y2);
    this.ctx.beginPath();
    this.ctx.filter = `blur(${this.ellipse._blur}px)`;
    this.ctx.arc(this.ellipse._pos.x, this.ellipse._pos.y, this.ellipse._radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const canvasRect = this.canvas.getBoundingClientRect();
    this.canvas.width = canvasRect.width * dpr;
    this.canvas.height = canvasRect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  sizeProps() {
    this.ellipse._pos.x = vwToPx(this.ellipse.pos.x);
    this.ellipse._pos.y = vhToPx(this.ellipse.pos.y);
    this.ellipse._radius = vwToPx(this.ellipse.radius);
    this.ellipse._blur = vwToPx(this.ellipse.blur);
  }

  handleResize() {
    this.sizeCanvas();
    this.sizeProps();
    this.drawEllipse();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
