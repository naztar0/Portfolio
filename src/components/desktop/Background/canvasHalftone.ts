import { scaleAny, vwToPx, vhToPx, Vector2 } from '@/services/utils';

interface Dot {
  pos: Vector2;
  radius: number;
}

interface Point {
  pos: Vector2;
  size: number;
  _pos: Vector2;
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
  mousePos: Vector2 = new Vector2();
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

  addPoint({ x, y, size }: { x: number, y: number, size: number }) {
    this.points.push({ pos: new Vector2(x, y), size, _pos: new Vector2(vwToPx(x), vhToPx(y)) });
  }

  animatePoint(index: number, x: number, y: number, size: number, time: number) {
    const point = this.points[index];

    const startPos = point._pos.copy();
    const targetPos = new Vector2(vwToPx(x), vhToPx(y));
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

        point._pos.set(startPos.x + step.x, startPos.y + step.y);

        this.drawDots();
        requestAnimationFrame(animate.bind(this));
      } else {
        point.pos.set(x, y);
        point._pos.set(targetPos.x, targetPos.y);
        point.size = size;
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
    this.dots.forEach((dot) => {
      dot.radius = 0;
      if (this.mousePos.x !== -1 && this.mousePos.y !== -1) {
        const distMouse = Vector2.dist(this.mousePos, dot.pos);
        dot.radius = this.clamp(this._maxSize - distMouse * 0.08, this._minSize, this._maxSize);
      }

      this.points.forEach((point) => {
        const distPoint = Vector2.dist(point._pos, dot.pos);
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
    this.points.forEach((point) => {
      point._pos.set(vwToPx(point.pos.x), vhToPx(point.pos.y));
    });
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
