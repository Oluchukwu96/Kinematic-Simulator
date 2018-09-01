
function Button(x,y,width,height,t="TEXT"){
	this.pos = [x,y];
	this.width= width;
	this.height = height;
	this.word = t;
	this.textsize = 25;
	//booleans
	this.highlighted = false;
	this.clicked = false;
	//constant
	this.color = "white";
	this.h_color = "#e1e4e8";
	
	//functions
	this.collide = function(x,y){
		if(x>=this.pos[0] && x<=(this.pos[0]+this.width)){
			if(y>=this.pos[1] && y<=(this.pos[1]+this.height)){
				return true;
			}
		}
		return false;
	}
	this.getmid = function(){
		var x = this.pos[0] + this.width/2;
		var y = this.pos[1] + this.height/2;
		return [x,y];
	}
	this.draw = function(){
		can.fillStyle=this.color;
		can.strokeStyle = "#6f7072";
		if(this.highlighted || this.clicked){
			can.fillStyle=this.h_color;
		}
		//can.rect(this.pos[0],this.pos[1],this.width,this.height);
		var r = this.height/5;
		this.roundRect(this.pos[0],this.pos[1],this.width,this.height,r);
		can.fill();
		can.stroke();
		//draw text
		can.fillStyle="#484a4c";
		can.textAlign = "center";
		can.textBaseline="middle";
		var s = this.textsize;
		if(this.clicked){
			s+=3;
		}
		can.font = (""+s+"px Arial");
		var mid = this.getmid();
		can.fillText(this.word, mid[0], mid[1]);
	}
	this.roundRect = function(x,y,w,h,r){
		var dl = 5;
		if(this.clicked){
			x-=dl;
			y-=dl;
			w+=dl*2;
			h+=dl*2;
		}
		can.beginPath();
		can.moveTo(x+r, y);
		can.arcTo(x+w, y,   x+w, y+h, r);
		can.arcTo(x+w, y+h, x,   y+h, r);
		can.arcTo(x,   y+h, x,   y,   r);
		can.arcTo(x,   y,   x+w, y,   r);
		can.closePath();
	}
}
