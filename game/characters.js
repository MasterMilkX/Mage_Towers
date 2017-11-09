/*global Image*/

//define the images
var studentIMG = new Image();
studentIMG.src = "../sprites/player/student.png";
var studentReady = false;
studentIMG.onload = function(){studentReady = true;};


//area for collision (x and y are relative to the object starting from the top right)
function boundArea(x, y, w, h){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

//student
var student = {
  //movement
  speed : 16,
  x : 0, 
  y : 0,
  velX : 0,
  velY : 0,
  friction: 0.75,
  jump: -7.75,

  //game properties
  dir : "right",
  action: "idle",
  in_special : false,
  //abilities : ["attack"],
  abilities : ["attack", "sprint", "block", "super attack", "heal", "hover"],
  health: 20,
  max_health: 20,
  attack_dmg: 1,
  super_dmg: 5,

  //image properties
  width : 64,
  height : 64,
  offsetX : -16,
  offsetY : 0,
  img : studentIMG,
  ready : studentReady,
  ba : new boundArea(16, 10, 32, 54),
  fps : 8,  //frame speed
  fpr : 5,  //# of frames per row
  show : true,
  
  //animation
  idleRight : [0,0,0,0],
  idleLeft : [9,9,9,9],
  runRight : [1,2,3,4],
  runLeft : [8,7,6,5],

  jumpRight : [3,3,3,3],
  jumpLeft : [6,6,6,6],
  fallRight : [10,10,10,10],
  fallLeft : [19,19,19,19],
  attackRight : [20,20,20,20],
  attackLeft : [29,29,29,29],

  blockRight : [11,11,11,11],
  blockLeft : [18,18,18,18],
  healRight : [12,12,12,12],
  healLeft : [17,17,17,17],
  beamRight : [13, 13, 13, 14],
  beamLeft : [16, 16, 16, 15],
  sprintRight: [21,21,21,21],
  sprintLeft : [28,28,28,28],

  hurtRight : [22,22,22,22],
  hurtLeft : [27,27,27,27],
  deathRight : [23 ,23, 24, 24],
  deathLeft : [26 ,26, 25, 25],

  curFrame : 0,
  ct : 0,
  seqlength : 4
}
