var canvasWidth = 0;
var canvasHeight = 0;

var players;
var shots;
var backLineVerticals;
var backLineHorizontals;

var lineAddCount;
var shotAddCount;

function setup() {
  createCanvas(windowWidth, windowHeight);
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  players = {};
  shots = [];
  backLineVerticals = [];
  backLineHorizontals = [];
  shotAddCount = 0;
  lineAddCount = 0;
}

function draw() {

  // background
  background(245, 245, 245);
  for (var i = 0; i < backLineHorizontals.length; i++) {
    backLineHorizontals[i].lh_move();
    if (!backLineHorizontals[i].lh_check()) {
      backLineHorizontals.splice(i, 1);
    } else {
      backLineHorizontals[i].lh_draw();
    }
  }
  for (var i = 0; i < backLineVerticals.length; i++) {
    backLineVerticals[i].lv_move();
    if (!backLineVerticals[i].lv_check()) {
      backLineVerticals.splice(i, 1);
    } else {
      backLineVerticals[i].lv_draw();
    }
  }

  // player
  for (key in players) {
    players[key].p_shield();
    players[key].p_draw();
    players[key].p_shot_draw();
  }

  // shots
  for (var i = 0; i < shots.length; i++){
    shots[i].s_move();
    if (shots[i].s_check) {
      shots[i].s_draw();
      for (key in players) {
        var flag = players[key].p_shot_check(shots[i].x, shots[i].y, shots[i].id);
        if (flag) {
          playerNotice(key, { 'status': 0 });
          delete players[key];
          shots.splice(i, 1);
        }
      }
    } else {
      shots.splice(i, 1);
    }
  }

  shotAddCount += 1;
  if (shotAddCount > 20) {
    for (key in players) {
      players[key].p_shot_add();
    }
    shotAddCount = 0;
  }

  lineAddCount += 1;
  if (lineAddCount > 30) {
    backLineHorizontals.push(new BackLineHorizontal());
    backLineVerticals.push(new BackLineVertical());
    lineAddCount = 0;
  }

}

class Player{

  constructor(player_id) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.radius = Math.min(windowWidth, windowHeight) / 12;
    this.color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    this.shotRadius = this.radius / 3;
    this.shotDistance = (this.radius / 2) + (this.shotRadius / 2);
    this.baseAngle = 0;
    this.player_id = player_id;
    this.shot = [[0, 0], [0, 0], [0, 0], [0, 0]];
    this.shield = 150;
  }

  move(x, y) {
    var len = Math.pow((Math.pow(Math.floor(x), 2) + Math.pow(Math.floor(y), 2)), 0.5);
    var move_x = 4 * (x / len);
    var move_y = 4 * (y / len);
    var tmp_x = this.x + move_x;
    var tmp_y = this.y + move_y;
    if (tmp_x > 0 && tmp_x < canvasWidth) {
      this.x  = tmp_x;
    }
    if (tmp_y > 0 && tmp_y < canvasHeight) {
      this.y = tmp_y;
    }
  }

  p_shield() {
    if (this.shield > -1) {
      this.shield -= 1;
      fill(0, 0, 0);
      ellipse(this.x, this.y, this.radius * 1.3, this.radius * 1.3);
    }
  }

  p_draw() {
    noStroke();
    fill(this.color[0], this.color[1], this.color[2]);
    ellipse(this.x, this.y, this.radius, this.radius);
  }

  p_shot_draw() {
    for (var i = 0; i < this.shot.length; i++) {
      var rad = (this.baseAngle + i * 90) * (Math.PI / 180);
      this.shot[i][0] = this.x + this.shotDistance * Math.cos(rad);
      this.shot[i][1] = this.y + this.shotDistance * Math.sin(rad);
      ellipse(this.shot[i][0], this.shot[i][1], this.shotRadius, this.shotRadius);
    }
  }

  p_shot_add() {
    if (this.shield < 0) {
      for (var i = 0; i < this.shot.length; i++) {
        var rad = (this.baseAngle + i * 90) * (Math.PI / 180);
        shots.push(new Shot(this.shot[i][0], this.shot[i][1], Math.cos(rad), Math.sin(rad), this.shotRadius, this.color[0], this.color[1], this.color[2], this.player_id));
      }
    }
  }

  p_shot_check(x, y, id) {
    var flag = false;
    if (this.shield < 0 && id != this.player_id && (Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2)) <= Math.pow(this.radius / 2, 2)) {
      flag = this.player_id;
    }
    return flag;
  }
}

class Shot{
  constructor(x, y, a_x, a_y, radius, r, g, b, id) {
    this.x = x;
    this.y = y;
    this.a_x = a_x;
    this.a_y = a_y;
    this.radius = radius;
    this.speed = 5;
    this.r = r;
    this.g = g;
    this.b = b;
    this.id = id;
  }

  s_move() {
    this.x += this.a_x * this.speed;
    this.y += this.a_y * this.speed;
  }

  s_draw() {
    noStroke();
    fill(this.r, this.g, this.b);
    ellipse(this.x, this.y, this.radius, this.radius);
  }

  s_check() {
    var flag = true;
    if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) flag = false;
    return flag;
  }
}

class BackLineHorizontal {
  constructor() {
    var set = Math.floor(Math.random() * 10);
    var vec = 1;
    if (set % 2 == 0) {
      vec = -1;
      this.y = canvasHeight;
    } else {
      this.y = 0;
    }
    
    this.start_x = 0;
    this.end_x = canvasWidth;
    this.a_y = vec * (Math.random() * 4 + 1);

    this.alpha = Math.random() * 30 + 20;
  }

  lh_move() {
    this.y += this.a_y;
  }

  lh_draw() {
    stroke(0, 0, 0, this.alpha);
    line(this.start_x, this.y, this.end_x, this.y);
  }

  lh_check() {
    var flag = true;
    if (this.y < 0 || this.y > canvasWidth) flag = false;
    return flag;
  }
}

class BackLineVertical {
  constructor() {
    var set = Math.floor(Math.random() * 10);
    var vec = 1;
    if (set % 2 == 0) {
      vec = -1;
      this.x = canvasWidth;
    } else {
      this.x = 0;
    }

    this.start_y = 0;
    this.end_y = canvasHeight;
    this.a_x = vec * (Math.random() * 4 + 1);

    this.alpha = Math.random() * 30 + 20;
  }

  lv_move() {
    this.x += this.a_x;
  }

  lv_draw() {
    stroke(0, 0, 0, this.alpha);
    line(this.x, this.start_y, this.x, this.end_y);
  }

  lv_check() {
    var flag = true;
    if (this.y < 0 || this.y > canvasWidth) flag = false;
    return flag;
  }
}

function playerAdd(data) {
  players[data['player_socket_id']] = new Player(data['player_socket_id']);
  //console.log(data['player_socket_id'] + ' game in');
}

function playerRemove(data) {
  if (players[data['player_socket_id']]) {
    delete players[data['player_socket_id']];
  }
}

function playerAction(data) {
  message = data['message'];
  if (players[data['player_socket_id']]) {
    switch (message['button']) {
      case 'pad':
        players[data['player_socket_id']].move(message['action']['x'], message['action']['y']);
        break;
      case 'a':
        players[data['player_socket_id']].baseAngle += 2;
        break;
      case 'b':
        players[data['player_socket_id']].baseAngle -= 2;
        break;
      default:
        console.log('error');
        break;
    }
  }
}