// Lightweight canvas animation exported as renderCanvas
// Ported from original source and typed loosely for browser usage
// Usage: import { renderCanvas } from '@/components/ui/canvas'

// @ts-ignore
function n(e: any) {
  // @ts-ignore
  this.init(e || {});
}
n.prototype = {
  // @ts-ignore
  init: function (e: any) {
    // @ts-ignore
    this.phase = e.phase || 0;
    // @ts-ignore
    this.offset = e.offset || 0;
    // @ts-ignore
    this.frequency = e.frequency || 0.001;
    // @ts-ignore
    this.amplitude = e.amplitude || 1;
  },
  update: function () {
    return (
      // @ts-ignore
      (this.phase += this.frequency),
      // @ts-ignore
      (e = this.offset + Math.sin(this.phase) * this.amplitude)
    );
  },
  value: function () {
    return e;
  },
};

// @ts-ignore
function Line(e: any) {
  // @ts-ignore
  this.init(e || {});
}

Line.prototype = {
  // @ts-ignore
  init: function (e: any) {
    // @ts-ignore
    this.spring = e.spring + 0.1 * Math.random() - 0.05;
    // @ts-ignore
    this.friction = E.friction + 0.01 * Math.random() - 0.005;
    // @ts-ignore
    this.nodes = [];
    for (var t, n = 0; n < E.size; n++) {
      // @ts-ignore
      t = new Node();
      // @ts-ignore
      t.x = pos.x;
      // @ts-ignore
      t.y = pos.y;
      // @ts-ignore
      this.nodes.push(t);
    }
  },
  update: function () {
    // @ts-ignore
    let e = this.spring,
      // @ts-ignore
      t = this.nodes[0];
    // @ts-ignore
    t.vx += (pos.x - t.x) * e;
    // @ts-ignore
    t.vy += (pos.y - t.y) * e;
    // @ts-ignore
    for (var n, i = 0, a = this.nodes.length; i < a; i++)
      // @ts-ignore
      (t = this.nodes[i]),
        0 < i &&
          // @ts-ignore
          ((n = this.nodes[i - 1]),
          (t.vx += (n.x - t.x) * e),
          (t.vy += (n.y - t.y) * e),
          (t.vx += n.vx * E.dampening),
          (t.vy += n.vy * E.dampening)),
        // @ts-ignore
        (t.vx *= this.friction),
        // @ts-ignore
        (t.vy *= this.friction),
        (t.x += t.vx),
        (t.y += t.vy),
        (e *= E.tension);
  },
  draw: function () {
    let e,
      t,
      // @ts-ignore
      n = this.nodes[0].x,
      // @ts-ignore
      i = this.nodes[0].y;
    // @ts-ignore
    ctx.beginPath();
    // @ts-ignore
    ctx.moveTo(n, i);
    // @ts-ignore
    for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
      // @ts-ignore
      e = this.nodes[a];
      // @ts-ignore
      t = this.nodes[a + 1];
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      // @ts-ignore
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }
    // @ts-ignore
    e = this.nodes[a];
    // @ts-ignore
    t = this.nodes[a + 1];
    // @ts-ignore
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    // @ts-ignore
    ctx.stroke();
    // @ts-ignore
    ctx.closePath();
  },
};

// Throttled mouse handler: only record last pointer and let render loop smooth it
// @ts-ignore
let _lastMouse: any = { x: 0, y: 0 };
let _needUpdate = false;

function initLines() {
  lines = [];
  for (let i = 0; i < E.trails; i++) {
    // @ts-ignore
    lines.push(new Line({ spring: 0.45 + (i / E.trails) * 0.025 }));
  }
}

// @ts-ignore
function onMousemove(e: any) {
  if (e.touches && e.touches.length) {
    _lastMouse.x = e.touches[0].pageX;
    _lastMouse.y = e.touches[0].pageY;
  } else {
    _lastMouse.x = e.clientX;
    _lastMouse.y = e.clientY;
  }
  _needUpdate = true;
  // prevent heavy default handlers
  try {
    e.preventDefault && e.preventDefault();
  } catch (err) {}
}

// lightweight touchstart handler to capture initial touch
function onTouchStart(e: any) {
  if (e.touches && e.touches.length) {
    _lastMouse.x = e.touches[0].pageX;
    _lastMouse.y = e.touches[0].pageY;
    _needUpdate = true;
  }
}

function render() {
  // @ts-ignore
  if (ctx.running) {
    // @ts-ignore
    ctx.globalCompositeOperation = "source-over";
    // @ts-ignore
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // @ts-ignore
    ctx.globalCompositeOperation = "lighter";
    // Smooth pointer: lerp pos toward lastMouse when needed
    if (_needUpdate) {
      pos.x += (_lastMouse.x - pos.x) * 0.14;
      pos.y += (_lastMouse.y - pos.y) * 0.14;
      // small decay to avoid stationary jitter
      if (Math.abs(_lastMouse.x - pos.x) < 0.5 && Math.abs(_lastMouse.y - pos.y) < 0.5) _needUpdate = false;
    }

    // Blue/white themed strokes with lower opacity for a smooth look
    // compute a subtle hue shift using the osc value
    const osc = (f && f.update && typeof f.update === 'function') ? Math.round(f.update()) : 220;
    const blueHue = 210 + (Math.abs(osc) % 20);
    // @ts-ignore
    ctx.strokeStyle = `hsla(${blueHue},80%,60%,0.06)`;
    // lighter lines for smoother rendering
    // @ts-ignore
    ctx.lineWidth = 4;
    for (var e, t = 0; t < Math.min(E.trails, lines.length); t++) {
      // @ts-ignore
      (e = lines[t]).update();
      e.draw();
    }
    // @ts-ignore
    ctx.frame++;
    window.requestAnimationFrame(render);
  }
}

function resizeCanvas() {
  // @ts-ignore
  ctx.canvas.width = window.innerWidth - 20;
  // @ts-ignore
  ctx.canvas.height = window.innerHeight;
}

// @ts-ignore
var ctx: any,
  // @ts-ignore
  f: any,
  e = 0,
  pos: any = {},
  // @ts-ignore
  lines: any[] = [],
  E = {
    debug: false,
    friction: 0.7,
    trails: 30,
    size: 24,
    dampening: 0.04,
    tension: 0.98,
  };
// @ts-ignore
function Node(this: any) {
  this.x = 0;
  this.y = 0;
  this.vy = 0;
  this.vx = 0;
}

export function renderCanvas() {
  // @ts-ignore
  ctx = document.getElementById("canvas")?.getContext("2d");
  if (!ctx) return;
  ctx.running = true;
  ctx.frame = 1;
  // @ts-ignore
  f = new n({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });
  // ensure canvas is sized first, then initialize pointer and lines
  resizeCanvas();
  const canvasEl = (ctx.canvas as HTMLCanvasElement) || { width: window.innerWidth, height: window.innerHeight };
  pos.x = canvasEl.width / 2;
  pos.y = canvasEl.height / 2;
  _lastMouse.x = pos.x;
  _lastMouse.y = pos.y;
  initLines();

  // attach lightweight handlers
  document.addEventListener("mousemove", onMousemove, { passive: true });
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onMousemove, { passive: true });
  document.body.addEventListener("orientationchange", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("focus", () => {
    // @ts-ignore
    if (!ctx.running) {
      // @ts-ignore
      ctx.running = true;
      render();
    }
  });
  window.addEventListener("blur", () => {
    // pause when tab is not focused
    try {
      // @ts-ignore
      ctx.running = false;
    } catch (err) {}
  });

  // start the render loop
  render();
}
