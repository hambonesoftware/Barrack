let hueValue = 0;

new p5(() => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function draw() {
    hueValue = (hueValue + 0.5) % 360;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsla(${hueValue}, 70%, 50%, 0.35)`);
    gradient.addColorStop(1, `hsla(${(hueValue + 120) % 360}, 70%, 40%, 0.35)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);
  }

  draw();
});
