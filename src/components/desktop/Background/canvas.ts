import { scaleAny } from '@/services/utils';

interface Dot {
  pos: Vector2;
  radius: number;
}

interface Point {
  pos: Vector2;
  size: number;
}

class Vector2 {
  constructor(public x: number, public y: number) {}

  static set(out: Vector2, x: number, y: number) {
    out.x = x;
    out.y = y;
  }

  static dist(a: Vector2, b: Vector2) {
    const x = a.x - b.x;
    const y = a.y - b.y;
    return Math.sqrt(x * x + y * y);
  }

  static normalize(out: Vector2, a: Vector2) {
    const length = Math.sqrt(a.x * a.x + a.y * a.y);
    if (length > 0) {
      out.x = a.x / length;
      out.y = a.y / length;
    }
  }

  static add(out: Vector2, a: Vector2, b: Vector2) {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
  }

  static scale(out: Vector2, a: Vector2, scale: number) {
    out.x = a.x * scale;
    out.y = a.y * scale;
  }
}

export class BgHalftone {
  cellSize = 30;
  maxSize = 15;
  minSize = 0;
  angle = 10;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  color = '';
  _cellSize = 0;
  _maxSize = 0;
  _minSize = 0;
  mousePos: Vector2 = new Vector2(-1, -1);
  dots: Dot[] = [];
  points: Point[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.sizeCanvas();
    this.sizeProps();
    this.updateColor();
    this.makeDots();
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  updateColor() {
    this.color = getComputedStyle(this.canvas).color;
  }

  addPoint(x: number, y: number, size: number = 1) {
    this.points.push({ pos: new Vector2(x, y), size });
  }

  animatePoint(index: number, x: number, y: number, size: number, time: number) {
    const point = this.points[index];

    const startPos = new Vector2(point.pos.x, point.pos.y);
    const targetPos = new Vector2(x, y);
    const totalDistance = Vector2.dist(startPos, targetPos);

    const startSize = point.size;
    const targetSize = size;
    const totalSize = targetSize - startSize;

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

        const sizeCovered = (elapsed / time) * totalSize;
        point.size = startSize + sizeCovered * (targetSize - startSize > 0 ? 1 : -1);

        Vector2.set(point.pos, startPos.x + step.x, startPos.y + step.y);

        this.drawDots();
        requestAnimationFrame(animate.bind(this));
      } else {
        Vector2.set(point.pos, targetPos.x, targetPos.y);
      }
    };

    requestAnimationFrame(animate.bind(this));
  }

  drawDot(dot: Dot) {
    const { pos, radius } = dot;
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawDots() {
    this.clear();
    this.dots.forEach(dot => {
      dot.radius = 0;
      if (this.mousePos.x !== -1 && this.mousePos.y !== -1) {
        const distMouse = Vector2.dist(this.mousePos, dot.pos);
        dot.radius = this.clamp(this._maxSize - distMouse * 0.08, this._minSize, this._maxSize);
      }

      this.points.forEach(point => {
        const distPoint = Vector2.dist(point.pos, dot.pos);
        const radiusPoint = this.clamp(this._maxSize - distPoint * 0.05 / point.size, this._minSize, this._maxSize);
        dot.radius = Math.max(dot.radius, radiusPoint);
      });

      this.drawDot(dot);
    });
  }

  makeDots() {
    this.dots = [];
    const side = Math.max(innerWidth, innerHeight);
    const numDotsX = Math.ceil(side * 3 / this._cellSize);
    const numDotsY = Math.ceil(side * 3 / this._cellSize);
    for (let i = 0; i < numDotsX; i++) {
      for (let j = 0; j < numDotsY; j++) {
        const x = i * this._cellSize + this._cellSize * 0.5 - side;
        const y = j * this._cellSize + this._cellSize * 0.5 - side;
        const cos = Math.cos(this.angle * Math.PI / 180);
        const sin = Math.sin(this.angle * Math.PI / 180);
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;

        if (
          rotatedX > -this._maxSize && rotatedX < innerWidth + this._maxSize &&
          rotatedY > -this._maxSize && rotatedY < innerHeight + this._maxSize
        ) {
          this.dots.push({ pos: new Vector2(rotatedX, rotatedY), radius: 0 });
        }
      }
    }
  }

  sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const canvasRect = this.canvas.getBoundingClientRect();
    this.canvas.width = canvasRect.width * dpr;
    this.canvas.height = canvasRect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  sizeProps() {
    this._cellSize = scaleAny(this.cellSize);
    this._maxSize = scaleAny(this.maxSize);
    this._minSize = scaleAny(this.minSize);
  }

  handleResize() {
    this.sizeCanvas();
    this.sizeProps();
    this.makeDots();
    this.drawDots();
  }

  handleMouseMove(event: MouseEvent) {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
    requestAnimationFrame(this.drawDots.bind(this));
  }

  clamp(value: number, min = 0, max = 1) {
    return value <= min ? min : value >= max ? max : value;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
