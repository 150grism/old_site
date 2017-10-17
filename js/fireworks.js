var canvas = document.querySelector('canvas');
var button = document.querySelector('button');

function Resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

Resize();
window.onresize = function() {
  Resize();
}

var c = canvas.getContext('2d');
var o;
var angleRocket = 80;

var rocketResistance = 0.963;
var sparkResistance = 0.99;
var deltaSparkResistance = 0.00001;
var startingGravity = 0.299;
var gravity = 1.01;
var maxGravity = 0.6;
var sparkOpacity = 0.93;
var sparksNumber = [10, 25];
var sparksSpeed = 8;
var rocketSpeedRange = 15;
var sparkRadiusRange = 1;

canvas.width < 500 ? angleRocket = 40 : angleRocket = 80;

// var rocketResistance = 0.963;
// var sparkResistance = 0.94;
// var gravity = 0.9999;
// var sparkOpacity = 0.95;
// var sparksNumber = [20, 25];
// var sparksSpeed = 25;
// var rocketSpeedRange = 15;
// var sparkRadiusRange = 1;

const colors = [
  '#00E8D1',
  '#61FF00',
  '#E000FF',
  '#FF5A00',
  '#F8FF00'
]

class Fly {
  constructor(x, y, speed, angle, angleZ, radius, opacity, color, id = 404, gravity = 1) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle;
    this.angleZ = angleZ;
    this.radius = radius;
    this.life = 0;
    this.color = color;
    this.opacity = opacity;
    this.gravity = gravity;
  }

  draw(LastPoint) {
    c.beginPath();
    c.strokeStyle = this.color;
    c.globalAlpha = this.opacity;
    // console.log(this.radius + ': ' + c.globalAlpha);
    c.lineWidth = this.radius;
    c.moveTo(LastPoint.x, LastPoint.y);
    c.lineTo(this.x, this.y);
    c.stroke();
    c.closePath();
  }

  update() {
    const LastPoint = {x: this.x, y: this.y};
    this.x += speedToXY(this.speed, this.angle, this.angleZ).dx;
    this.y += speedToXY(this.speed, this.angle, this.angleZ).dy;
    this.draw(LastPoint);
  }
}

function animate() {
  var t0 = performance.now();

  requestAnimationFrame(animate);
  c.globalAlpha = 1;
  c.fillStyle = 'rgba(0,0,0,0.3)';
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (o = 0; o < rockets.length; o++) {
    // console.log(o + ' ' + rockets.length);

    rockets[o].life++;

    if (rockets[o].life === 100) {
      sparks[o] = [];
      let sparkSNumber = Math.floor(Math.random() * (sparksNumber[1] - sparksNumber[0]) + sparksNumber[0]);
      for (let i = 0; i < sparkSNumber; i++) {
        for (let j = 0; j < sparkSNumber; j++) {
          let sparkSAngleI = Math.random() * (360 / sparkSNumber) + (i / sparkSNumber * 360);
          let sparkSAngleJ = Math.random() * (360 / sparkSNumber) + (j / sparkSNumber * 360);
          sparks[o].push(new Fly(rockets[o].x, rockets[o].y, sparksSpeed, sparkSAngleI, sparkSAngleJ, Math.random() * sparkRadiusRange, 1, rockets[o].color));
          // console.log('angle ' + i / 20 * 360 + '; color:' + sparks[o][i].color);
          // console.log(sparks[o].length);
        }
      }
      
    }
    rockets[o].speed *= rocketResistance;
    // this.radius -= this.life * this.dy * 0.01;

    rockets[o].update();
    if (sparks[o].length > 0) {
      // console.log(rockets[o].gravity);
      // rockets[o].gravity < 0.5 ? rockets[o].gravity *= gravity : rockets[o].gravity = 0;
      sparks[o].forEach(function(spark) {
        spark.opacity *= sparkOpacity;
        spark.speed *= sparkResistance;
        if (rockets[o].gravity < maxGravity) {
          spark.speed = fuse(spark.speed, spark.angle, rockets[o].gravity, 90).speed;
          spark.angle = fuse(spark.speed, spark.angle, rockets[o].gravity, 90).angle;
        }
        spark.update();
      });
    }
    // console.log(o + ' ' + rockets.length);
    
    // if (rockets[o].life === 300) {
    //   console.log(rockets.length);
    //   rockets.shift();
    //   o--;
    // }

  }
  var t1 = performance.now();
  console.log("Call to doSomething took " + (t1 - t0).toFixed(2) + " milliseconds.");
}

function speedToXY(speed, angle, angleZ = 0) {
  let obj = {};
  obj.dx = speed * Math.cos(angle / 180 * Math.PI) * Math.cos(angleZ / 180 * Math.PI);
  obj.dy = speed * Math.sin(angle / 180 * Math.PI);
  return obj;
}

function fuse(speed1, angle1, speed2, angle2) {
  let obj = {}
  obj.dx = speedToXY(speed1, angle1).dx + speedToXY(speed2, angle2).dx;
  obj.dy = speedToXY(speed1, angle1).dy + speedToXY(speed2, angle2).dy;
  obj.speed = Math.sqrt(Math.pow(obj.dx, 2) + Math.pow(obj.dy, 2));
  obj.angle = Math.atan2(obj.dy, obj.dx) / Math.PI * 180;
  if (Math.abs(obj.dx) < 0.00001 && Math.abs(obj.dy) < 0.00001) {
    obj.angle = angle1;
  }
  // }
  return obj;
}

// console.log(Math.sqrt(0));
// console.log(speedToXY(1, -90).dx);
// console.log(Math.sqrt(Math.pow(0,2) + Math.pow(0,2)));
// console.log(Math.atan2(-2,0) / Math.PI * 180);
// console.log(speedToXY(5.38, Math.atan2(-5,2) / Math.PI * 180));

// var angg = -160;

// console.log('@ fuse speed: ' + fuse(1, angg, 1, 90).speed);
// console.log('@ fuse angle: ' + fuse(1, angg, 1, 90).angle);
// console.log('@ 1fuse dx: ' + fuse(1, angg, 1, 90).dx);
// console.log('@ 1fuse dy: ' + fuse(1, angg, 1, 90).dy);

var rockets = [];
var sparks = [[], [], [], [], [], [], [], [], [], []];
var id = 0;

button.onclick = function() {
  id++;
  if (rockets.length > 9) {
    rockets.shift();
    o--;
  }
  rockets.push(new Fly(canvas.width/2, canvas.height*0.9, Math.random() * (rocketSpeedRange) + 10, Math.random() * (-angleRocket) - (180 - angleRocket) / 2, 0, 1, 1, colors[Math.floor(Math.random() * colors.length)], id, startingGravity));
  console.log(rockets.length + ' id :' + rockets[rockets.length - 1].id);
  // console.log(rockets[o].gravity);
};
// var papardicle = new Circle(-10000, -10000, 10, angg, 5);
// var spark = new Circle(-100, -100, 10, 0, 5);

animate();

// if (rockets[o].radius === 100) {
//   var spark = new Circle(rockets[o].x, rockets[o].y, rockets[o].dx, rockets[o].dy, rockets[o].radius);
// }
