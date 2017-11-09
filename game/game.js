//////     ///////    //////   GAME CODE    //////   //////   //////  ///////

//Global variables
/*global student*/

var test = 0;
var keyTick = 0;
var kt = null;

//set up the canvas
var canvas = document.createElement("canvas");
canvas.id = "game";
var ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 160;
document.body.appendChild(canvas);

//background image
var bgPNG = new Image();
if(test)
	bgPNG.src = "../sprites/architecture/template/level_template.png";
else
	bgPNG.src = "../sprites/architecture/red/dungeon2_red.png";
//bgPNG.width = 640;
//bgPNG.height = 320;
bgPNG.onload = function(){
	ctx.drawImage(bgPNG, 0, 0);
};


//bounding area
//area for collision (x and y are relative to the object starting from the top right)
function boundArea(x, y, w, h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}


//level
var level_loaded = true;
var rows = 10;
var cols = 40;
var size = 16;
var floor_bound = canvas.height - 8;
var tpr = 2;
var map = [];

var tiles = new Image();
if(test)
	tiles.src = "../sprites/architecture/template/test_floor.png";
else
	tiles.src = "../sprites/architecture/template/floor.png";
var tilesReady = false;
tiles.onload = function(){
  tilesReady = true;
};

//camera
var camera = {
	x : 0,
	y : 0
};
var screen_width = 500;

//controls
var keys = [];
var upKey = 38; //[Up]
var leftKey = 37; 
var rightKey = 39;
var downKey = 40;
var moveKeySet = [upKey, leftKey, rightKey, downKey];

var wKey = 87;
var aKey = 65;
var sKey = 83;
var dKey = 68;
var actionKeySet = [wKey, aKey, sKey, dKey];

var gravity = 0.5;
var term_vel = 3;
var hasGravity = true;
var jumped = false;
var canJump = false;
var use_special = true;

//colliding variables
var pixX;
var pixY;
var nextX;
var nextY;
var colTileX = 0;
var colTileY = 0;

//fireballs
function getIMGITEM(name){
	var itemIMG = new Image();
	itemIMG.src = "../sprites/objects/" + name + ".png";
	var itemReady = false;
	itemIMG.onload = function(){itemReady = true;};

	this.img = itemIMG;
	this.ready = itemReady;
}

function basic_attack(mage, color){
	var set = getIMGITEM("fireball_" + color);
	this.img = set.img;
	this.ready = set.ready;
	this.ba = new boundArea(0, 0, 16, 16);
	this.speed = 10;
	this.dir = mage.dir;

}


//lists
var mages = [];


/////////////////////////////  LEVEL SETUP  ///////////////////////////
function basicLevel(){
	map = [];
	//empty space
	for(var r=0;r<rows;r++){
		var layer = [];
		for(var c=0;c<cols;c++){
			layer[c] = 0;
		}
		map.push(layer);
	}
	//floor
	/*
	var layer = [];
	for(var c=0;c<cols;c++){
			layer[c] = 0;
	}
	map.push(layer);
	*/
}

basicLevel();


/////////////////////////DRAWING AND RENDERING//////////////////////////
//check for render ok
function checkRender(){
  //tiles
  if(!tilesReady){
    tiles.onload = function(){
      tilesReady = true;
    };
  }
}

//rendering function for the map
function drawMap(){
  if(tilesReady && level_loaded){
    for(var y = 0; y < rows; y++){
      for(var x = 0; x < cols; x++){
        //if(withinBounds(x,y)){
          //ctx.drawImage(tiles, size * map[y][x], 0, size, size, (x * size), (y * size), size, size);
          ctx.drawImage(tiles, 
            size * Math.floor(map[y][x] % tpr), size * Math.floor(map[y][x] / tpr), 
            size, size, 
            (x * size), (y * size), 
            size, size);
        //}
      }
    }
  }
}


//rendering functions for the characters
function drawMage(mage){
   updateMage(mage);
   renderMage(mage);
}

function drawItems(){}

function drawGUI(){}

function updateMage(mage){
	//update the frames
	if(mage.ct == (mage.fps - 1)){
		mage.curFrame = (mage.curFrame + 1) % mage.seqlength;
	}
	 
  	mage.ct = (mage.ct + 1) % mage.fps;
}
function renderMage(mage){
	//set the animation sequence
	var sequence;
		if(mage.action === "idle")
			sequence = (mage.dir === "left" ? mage.idleLeft : mage.idleRight);
		else if(mage.action === "run")
			sequence = (mage.dir === "left" ? mage.runLeft : mage.runRight);
		else if(mage.action === "jump")
			sequence = (mage.dir === "left" ? mage.jumpLeft : mage.jumpRight);
		else if(mage.action === "fall")
			sequence = (mage.dir === "left" ? mage.fallLeft : mage.fallRight);
		else if(mage.action === "hurt")
			sequence = (mage.dir === "left" ? mage.hurtLeft : mage.hurtRight);
		else if(mage.action === "attack")
			sequence = (mage.dir === "left" ? mage.attackLeft : mage.attackRight);
		else if(mage.action === "sprint")
			sequence = (mage.dir === "left" ? mage.sprintLeft : mage.sprintRight);
		else if(mage.action === "block")
			sequence = (mage.dir === "left" ? mage.blockLeft : mage.blockRight);
		else if(mage.action === "heal")
			sequence = (mage.dir === "left" ? mage.healLeft : mage.healRight);
		else if(mage.action === "beam")
			sequence = (mage.dir === "left" ? mage.beamLeft : mage.beamRight);
		else 
			sequence = (mage.dir === "left" ? mage.idleLeft : mage.idleRight);
	
	//get the row and col of the current frame
	var row = Math.floor(sequence[mage.curFrame] / mage.fpr);
	var col = Math.floor(sequence[mage.curFrame] % mage.fpr);
	
	if(mage.show){
		ctx.drawImage(mage.img, 
		col * mage.width, row * mage.height, 
		mage.width, mage.height,
		mage.x + mage.offsetX, mage.y + mage.offsetY, 
		mage.width, mage.height);
	}
}

//overall rendering function
function render(){
  	checkRender();
  	ctx.save();

  	ctx.translate(-camera.x, -camera.y);

	//clear eveoything
  	ctx.clearRect(camera.x, camera.y, canvas.width,canvas.height);
	
	//re-draw bg
	var ptrn = ctx.createPattern(bgPNG, 'repeat'); // Create a pattern with this image, and set it to "repeat".
	ctx.fillStyle = ptrn;
	ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);
	
	
	//drawMap();				//draw the map
	drawItems();			//draw the items
	drawMage(student);	//draw the student
	drawGUI();				//draw GUI
	
	ctx.restore();
	
}

//////////////////// collision events ///////////////////////
function withinBounds(x,y){
	var xBound = (x >= Math.floor(camera.x / size) - 1) && (x <= Math.floor(camera.x / size) + (canvas.width / size));
	return xBound;
}

//////////////////key events/////////////
function keyboard(){

	//define the action
	if((keys[rightKey] || keys[leftKey]) && !student.in_special){
		if(student.velY == 0)
			student.action = "run";
		else if(student.velY > 0)
			student.action = "fall";
		else if(student.velY < 0)
			student.action = "jump";
	}else if(!keys[rightKey] && !keys[leftKey] && !student.in_special){
		if(Math.round(student.velX) == 0 && Math.round(student.velY) == 0){
			student.action = "idle";
		}else if(Math.round(student.velY) > 0){
			student.action = "fall"
		}else if(Math.round(student.velY) < 0){
			student.action = "jump";
		}
	}

	if(keys[wKey]){
		student.in_special = true;
		student.action = "heal";
		use_special = false;
	}else if(keys[dKey]){
		student.in_special = true;
		student.action = "block";
		use_special = false;
	}else if(use_special){
		student.in_special = false;
	}

	//set the speed
	if(keys[rightKey]){
		student.dir = "right";
		if (student.velX < student.speed  && !student.in_special)
			student.velX += student.friction;
	}else if(keys[leftKey]){
		student.dir = "left";
		if (student.velX > -student.speed  && !student.in_special)
			student.velX -= student.friction;
	}
	
}

//return if any key from set is pressed
function action_keys(){
	return (keys[wKey] || keys[aKey] || keys[sKey] || keys[dKey]);
}
function move_keys(){
	return (keys[upKey] || keys[downKey] || keys[leftKey] || keys[rightKey]);
}
function any_key(){
	return action_keys() || move_keys();
}

function move(){
	
	//in mid-air
	if(!colliding("vertical") && hasGravity && !jumped){
		// apply some gravity to y velocity.
		if(student.velY < term_vel)
			student.velY += gravity;       //increase the force of gravity
		else
			student.velY = term_vel;    //terminal velocity
			
		student.y += student.velY;    //apply the velocity
	}else if(colliding("vertical") && !jumped){    //on the ground
		student.velY = 0;
		canJump = true;
	}else if(jumped){
		student.y += student.velY;
		jumped = false;
	}
	
	/*
	//check horizontal collisions
	if(!colliding("horizontal")){
		// apply some friction to x velocity.
		student.velX *= student.friction;
		student.x += student.velX;
		
		//camera displacement
		if((student.x >= (canvas.width / 2)) && (student.x <= (map[0].length * size) - (canvas.width / 2)))
			camera.x = student.x - (canvas.width / 2);
		
		
	}else{
		student.velX = 0;
		student.x = colTileX;
	}
	*/
	
	// bounds checking
	if (student.x >= (map[0].length * size - student.hitBoxW)) {
			student.x = (map[0].length * size - student.hitBoxW);
	} else if (student.x <= 0) {
			student.x = 0;
	}

/*
	if (student.y > (canvas.height - size)) {
			student.y = canvas.height - size;
	}
*/

	// apply some friction to x velocity.
	student.velX *= student.friction;
	student.x += student.velX;
		
	//camera displacement
	if(student.x < (canvas.width / 2))
		camera.x = 0;
	else if(student.x > (bgPNG.width - (canvas.width/2)))
		camera.x = bgPNG.width - canvas.width;
	else
		camera.x = student.x - canvas.width / 2;
}
function jump(e){
	if(e.keyCode == upKey && canJump){
		canJump = false;
		jumped = true;
		student.velY += student.jump;
		student.acton = "jump";
		//console.log("hop you bastard!");
	}
}

function do_a_thing(e){


	/*
	if(actionKeySet.indexOf(e.keyCode) != -1 && !student.in_special && use_special && keyTick < 1){
		use_special = false;
		student.in_special = true;

		if(e.keyCode == wKey && student.abilities.indexOf("heal"))
			student.action = "heal";
		else if(e.keyCode == dKey && student.abilities.indexOf("block"))
			student.action = "block";
		else if(e.keyCode == sKey && student.abilities.indexOf("sprint"))
			student.action = "sprint";


	}else if(keyTick >= 1 && student.action !== "heal" && student.action !== "defend"){
		use_special = false;
		student.in_special = false;
	}
	*/
}

function colliding(axis){
	if(tilesReady){
		if(axis === "vertical"){
			if((student.y + student.height) < floor_bound){
				return false;
			}else{
				return true;
			}
			/*
			if(student.dir === "left")
				pixX = Math.ceil(student.x / size);
			else
				pixX = Math.floor(student.x / size);
				
			pixY = Math.floor(student.y / size);
			nextY = pixY + 1;     //bottom
				
			if(map[nextY][pixX] !== 0){
				colTileY = pixY * size;
				return true;
			}
			else{
				return false;
			}
			*/
		}
		else if(axis === "horizontal"){
			if(student.dir === "left")
				pixX = Math.ceil(student.x / size);
			else
				pixX = Math.floor(student.x / size);
				
			pixY = Math.floor(student.y / size);
			nextX = pixX + (student.dir === "left" ? -1 : 1);  //left or right side
			if(map[pixY][nextX] !== 0){
				if(student.dir === "right")
					colTileX = pixX * size;
				else
					colTileX = Math.ceil(student.x / size) * size;

				return true;
			}else
				return false;
		}else{
			return false;
		}
	}
}

//main updating function
function main(){
	requestAnimationFrame(main);
	canvas.focus();
	render();
	
	// key events
	document.body.addEventListener("keydown", function (e) {
		keys[e.keyCode] = true;
	});
	document.body.addEventListener("keyup", function (e) {
		keys[e.keyCode] = false;
		jumped = false;
		if(actionKeySet.indexOf(e.keyCode) != -1 || !action_keys()){
			in_special = false;
			use_special = true;
		}
	});
	document.body.addEventListener("keydown", jump);
	document.body.addEventListener("keydown", do_a_thing);
	

	
	//settings debugger screen
	var settings = "X: " + Math.round(student.x) + " | Y: " + Math.round(student.y);
	settings += " --- Vel X: " + Math.round(student.velX) + " | Vel Y: " + Math.round(student.velY);
	settings += " --- Action: " + student.action + " | Collide Y: " + colliding("vertical");
	settings += " --- Key Tick: " + keyTick + " | In Special: " + student.in_special;
	document.getElementById('studentSettings').innerHTML = settings;

	//waits a half second
	var actkey = action_keys();
	if(actkey && kt == 0){
		kt = setInterval(function(){keyTick+=1}, 75);
	}else if(!actkey){
		clearInterval(kt);
		kt = 0;
		keyTick=0;
	}

	keyboard();
	move();

}

//LETS PLAY!
main();