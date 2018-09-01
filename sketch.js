//some global variables
var can; //variable for storing the canvas
var canvas;
//list variables
var myvec = new vec();
//pointer variables
var buttons = [];
var pointer = null;
var clicking = false;
var loader = new storage();
var mech = new mechanism();
var gui = new manageGUI(); //Graphics User Interface
var dragging = false; //boolean to see if we are dragging a boolean across the screen or not
var last =[0,0]; // th last point clicked on the screen
//keep track of the x and y positions of the mouse
var mouseX=0;
var mouseY=0;
var gridsize = 50;
//globals
var stayRight = false;
var stayDown = false;
var xMiddle = false;
var yMiddle = false;
function setup() {
	canvas = document.getElementById('game');
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
	playing=true;
	if(canvas.getContext){
		can = canvas.getContext('2d');
		//calculate variables
		startx=canvas.offsetLeft;
		starty=canvas.offsetTop;
		width=canvas.width;
		height=canvas.height;
		
		//set up positions
		//resetScreen();
	}
	else{
		alert("Your browser doesn't support canvas consider changing your browser")
	}
	tests();
	//adjust the canvas to the sive of the window
	window.onresize = function(event){
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
		gui.prepare(width,height);
		width=canvas.width;
		height=canvas.height;
		gui.resize(width,height);
		gui.width = width;
		gui.height = height;
	};
	//add mouse up event listerner in canvas
	canvas.addEventListener('mouseup', function(event){
		dragging = false;
		clicking = false;
		mouseX=event.pageX - canvas.offsetLeft;
		mouseY=event.pageY - canvas.offsetTop;
		mech.mouseup([mouseX,mouseY]);
		gui.mouseup([mouseX,mouseY]);
	},false);
	//update the mouse position everytime it is moved
	canvas.addEventListener('mousemove', function(event){
		mouseX=event.pageX - canvas.offsetLeft;
		mouseY=event.pageY - canvas.offsetTop;
		mech.mousemove([mouseX,mouseY]);
		gui.mousemove([mouseX,mouseY]);
	},false);
	//adding an event listener to our canvas
	canvas.addEventListener('mousedown', function(event) {
        var x = event.pageX - canvas.offsetLeft;
		var y = event.pageY - canvas.offsetTop;
		if(!gui.mousedown([x,y])){
			mech.mousedown([x,y]);
		}
		
		//unclear all clicks
		//draw screen elements
		for(var i=0;i<buttons.length;i++){
			buttons[i].clicked = false;
		}
		clicking = true;
		//Todo: Drag and drop object
	}, false);
	init();
	setInterval(gameloop, 60);
}
function init(){
	gui.init(width,height);
	//add some buttons
	var w = 110;
	var h = 40;
	var margin = 30;
	//some buttons
	gui.getbutton(margin,margin+5,80,30,"SAVE");
	gui.getbutton(120,margin,w,h,"LOAD");
	//line
	var y = 150;
	var dy = 55;
	gui.getbutton(margin,y,w,h,"JOINT");
	y+=dy;
	gui.getbutton(margin,y,w,h,"GEAR");
	y+=dy;
	gui.getbutton(margin,y,w,h,"LINK");
	y+=dy;
	gui.getbutton(margin,y,w,h,"PATH");
	y+=dy;
	gui.getbutton(margin,y,w,h,"JOIN");
	y+=dy;
	gui.getbutton(margin,y,w,h,"DELETE");
	y+=(3*dy);
	stayDown = true;
	gui.getbutton(margin,height- 60,w,h,"CLEAR");
	stayDown = false;
	//gui.imgbutton(margin+200,y-dy,50,50,"pause");
	xMiddle = true;
	gui.imgbuttons(width/2,margin,50,50,["play","pause"]);
	gui.addtag("sim");
	//gui.listout(250,150,w,h,["b1","joint","eat","play"]);
	xMiddle = false;
	stayRight = true;
	gui.getdropdown(width-110-150,margin+150,w+100,h,"Samples",["4-bars","6-bars","mech1","mech2"]);
	gui.gettextbox(width-110-60,margin-10,w,h,"Fixed");
	gui.radiobutton(width-70,margin,25);
	gui.addtag("update");
	mech.fixed = gui.lastclicker();
	gui.gettextbox(width-110-75,margin+40,w,h,"Rotating");
	gui.radiobutton(width-70,margin+50,25);
	gui.addtag("update");
	mech.rotating = gui.lastclicker();
	gui.gettextbox(width-110-52,margin+90,w,h,"Grid");
	gui.radiobutton(width-70,margin+100,25,true);
	gui.addtag("update");
	mech.grid = gui.lastclicker();
	stayDown = true;
	gui.getslider(width-110-150,height- 50,200,20);
	stayDown = false;
	stayRight = false;
}
function updatebuttons(){
	//unhighlight all buttons
	var po = [mouseX,mouseY];
	//draw screen elements
	for(var i=0;i<buttons.length;i++){
		buttons[i].highlighted = false;
	}
	//check if mouse is over a button
	for(var i=0;i<buttons.length;i++){
		if(buttons[i].collide(mouseX,mouseY)){
			buttons[i].highlighted = true;
			if(clicking){
				buttons[i].clicked = true;
			}
			break;
		}
	}
	
}
//function to click on objects on the screen return false if no click was made
function click(x,y){
	return false;
}
//function to get the mouse position of the canvas
function tests(){
	var tl = new linkage([]);
	//alert(tl.rayshoot([3,0],[-1,0],[0,3],[0,-0.00001]));
}
//display objects on the screen
function display(text){
	can.font = "70px Arial";
	can.fillStyle="#4af441";
	can.textAlign = "center";//center text at the center of the screen
	can.fillText(text,width/2,height/2);
}
function gameloop(){
	clearScreen();
	update();
	//draw screen elements
	for(var i=0;i<buttons.length;i++){
		buttons[i].draw();
	}
	mech.update();
	mech.draw();
	gui.update();
	gui.draw();
	
}
function update(){
	updatebuttons();
	
	
}
function drawGrid(){
	//draw vertical lines
	var x = gridsize/2;
	while(x<width){
		drawLine([x,0],[x,height]);
		x+=gridsize;
	}
	//draw horizontal lines
	var y = gridsize/2;
	while(y<height){
		drawLine([0,y],[width,y]);
		y+=gridsize;
	}
}
function drawLine(p1,p2){
	can.strokeStyle="#6f7072";
	can.beginPath();
	can.lineWidth=2;
	can.moveTo(p1[0],p1[1]);
	can.lineTo(p2[0],p2[1]);
	can.stroke();
	can.closePath();
}
//create a random ellipse and add it to the screen
function getShape(x,y){
	
}
function clearScreen(){
	//reset screen to normal
	//can.clearRect(0,0,width,height);
	can.fillStyle = "#eff1f2";
	can.rect(0,0,width,height);
	can.fill();
}
function randrange(start,end){
	var size=end-start;
	var ans=Math.random()*size;
	ans=Math.floor(ans);
	return ans+start;
}

