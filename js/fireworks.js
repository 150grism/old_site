var canvas = document.querySelector('canvas');
var button = document.querySelector('button');

function Resize() {
  canvas.width = window.innerWidth - 2;
  canvas.height = window.innerHeight - 2;
  //от ширины канваса зависит угол, под которым вылетают ракеты
  canvas.width < 500 ? angleRocket = 40 : angleRocket = 80;
  //от высоты канваса зависит начальная скорость ракет
  rocketSpeedRange = canvas.height / 36 - 10;
};

Resize();
window.onresize = function() {
  Resize();
}

var c = canvas.getContext('2d');
var o;

//значения
var rocketResistance = 0.963;
var sparkResistance = 0.99;
var deltaSparkResistance = 0.00001;
var startingGravity = 0.299;
var gravity = 1.01;
var maxGravity = 0.6;
var sparkOpacity = 0.93;
var sparksNumber = [10, 25];
var sparksSpeed = 8;
var sparkRadiusRange = 1;
var allowedRockets = 10;
var angleRocket;
var rocketSpeedRange;

//доступные цвета для ракет/искр
const colors = [
  '#00E8D1',
  '#61FF00',
  '#E000FF',
  '#FF5A00',
  '#F8FF00'
]

//для перевода параметров искр из полярной системы координат в пространстве в прямоугольную на плоскости
function speedToXY(speed, angle, angleZ = 0) {
  let obj = {};
  obj.dx = speed * Math.cos(angle / 180 * Math.PI) * Math.cos(angleZ / 180 * Math.PI);
  obj.dy = speed * Math.sin(angle / 180 * Math.PI);
  return obj;
}

//объекты, имеющие параметры speed1, angle1, испытывают на себе влияние силы, "имеющую скорость speed2" под углом angle2
//эта функция возвращает новые значения скорости и угла объекта
function fuse(speed1, angle1, speed2, angle2) {
  let obj = {}
  obj.dx = speedToXY(speed1, angle1).dx + speedToXY(speed2, angle2).dx;
  obj.dy = speedToXY(speed1, angle1).dy + speedToXY(speed2, angle2).dy;
  obj.speed = Math.sqrt(Math.pow(obj.dx, 2) + Math.pow(obj.dy, 2));
  obj.angle = Math.atan2(obj.dy, obj.dx) / Math.PI * 180;
  if (Math.abs(obj.dx) < 0.00001 && Math.abs(obj.dy) < 0.00001) {
    obj.angle = angle1;
  }
  return obj;
}

//все объекты на канвасе (ракеты и искры от ракет) - от класса Fly
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
  requestAnimationFrame(animate);
  //очищение канваса
  c.globalAlpha = 1;
  c.fillStyle = 'rgba(0,0,0,0.3)';
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (o = 0; o < rockets.length; o++) {

    //срок жизни ракеты с индексом "o"
    rockets[o].life++;

    //когда срок жизни ракеты = 100, выпускаются искры
    if (rockets[o].life === 100) {
      //обнуляем все искры с индексом "o"
      sparks[o] = [];
      //определяем количество выпускаемых искр на основании чисел sparksNumber[1] и sparksNumber[0]
      let sparkSNumber = Math.floor(Math.random() * (sparksNumber[1] - sparksNumber[0]) + sparksNumber[0]);
      for (let i = 0; i < sparkSNumber; i++) {
        for (let j = 0; j < sparkSNumber; j++) {
          //угол между осью X и Y
          let sparkSAngleI = Math.random() * (360 / sparkSNumber) + (i / sparkSNumber * 360);
          //угол между осью X и Z
          let sparkSAngleJ = Math.random() * (360 / sparkSNumber) + (j / sparkSNumber * 360);
          sparks[o].push(new Fly(rockets[o].x, rockets[o].y, sparksSpeed, sparkSAngleI, sparkSAngleJ, Math.random() * sparkRadiusRange, 1, rockets[o].color));
        }
      }
    }
    //скорость ракеты уменьшается на основании значения rocketResistance
    rockets[o].speed *= rocketResistance;

    rockets[o].update();

    //если искры у ракеты "o" есть, то для каждой отдельной искры:
    if (sparks[o].length > 0) {
      sparks[o].forEach(function(spark) {
        //уменьшаем яркость искры
        spark.opacity *= sparkOpacity;
        //уменьшаем скорость искры на основании значения sparkResistance
        spark.speed *= sparkResistance;
        //если значение gravity (скорость притяжения) икр меньше максимально допустимого, то "влияем" на нашу искру силой "со скоростью" rockets[o].gravity и под углом 90 градусов (вертикально вниз)
        //обновляем значения скорости и угла искры на оснвании этого
        if (rockets[o].gravity < maxGravity) {
          spark.speed = fuse(spark.speed, spark.angle, rockets[o].gravity, 90).speed;
          spark.angle = fuse(spark.speed, spark.angle, rockets[o].gravity, 90).angle;
        }
        spark.update();
      });
    }
  }
}

//ракеты хранятся в массиве
var rockets = [];
//искры хранятся в двумерном массиве, первый индекс соответствует индексу ракеты, которая выпускает массив искр
var sparks = [];
for(let x = 0; x < allowedRockets; x++){
  sparks[x] = [];    
}
//id ракеты
var id = 0;

button.onclick = function() {
  id++;
  //количество ракет должно быть меньше allowedRockets - в противном случае убираем ракету из начала массива ракет
  if (rockets.length > allowedRockets - 1) {
    rockets.shift();
    o--;
  }
  //добавляем ракету в конец массива ракет
  rockets.push(new Fly(canvas.width/2, canvas.height*0.9, Math.random() * (rocketSpeedRange) + 10, Math.random() * (-angleRocket) - (180 - angleRocket) / 2, 0, 1, 1, colors[Math.floor(Math.random() * colors.length)], id, startingGravity));
};

animate();