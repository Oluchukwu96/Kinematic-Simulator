function Pos(x,y,width,height){
	this.pos = [x,y];
	this.width= width;
	this.height = height;
	this.Parent = null;
	this.visible = true;
	this.stayright = stayRight;
	this.staydown = stayDown;
	this.xmiddle = xMiddle;
	this.ymiddle = yMiddle;
	this.dx=0;
	this.dy=0;
	this.isvisible = function(){
		if(this.Parent == null){
			return this.visible;
		}
		return this.Parent.isvisible();
	}
	
	this.getmid = function(){
		var pos = this.getpos();
		var x = pos[0] + this.width/2;
		var y = pos[1] + this.height/2;
		return [x,y];
	}
	this.getpos = function(){
		return this.pos;
	}
	this.getwidth = function(){
		return this.width;
	}
	this.getheight = function(){
		return this.height;
	}
	this.prepare = function(w,h){
		if(this.stayright){
			this.dx = w -this.pos[0];
		}
		if(this.staydown){
			this.dy = h -this.pos[1];
		}
		if(this.xmiddle){
			this.dx = w/2 -this.pos[0];
		}
		if(this.ymiddle){
			this.dy = h/2 -this.pos[1];
		}
	}
	this.resize = function(w,h){
		if(this.stayright){
			this.pos[0] = w -this.dx;
		}
		if(this.staydown){
			this.pos[1] = h -this.dy;
		}
		if(this.xmiddle){
			this.pos[0] = w/2 -this.dx;
		}
		if(this.ymiddle){
			this.pos[1] = h/2 -this.dy;
		}
	}
}
function collider(pos){
	this.rpos = pos;
	this.clicked = false;
	this.highlighted = false;
	this.tags = [];
	this.deps =[];
	//timing variables
	this.maxtime=3;
	this.time = 0;
	this.waiting = true;
	this.timing = true; //will click time be limited
	this.isnumb = false;
	this.collide = function(x,y){
		if(this.isnumb){
			return false;
		}
		
		var pos = this.rpos.getpos();
		if(x>=pos[0] && x<=(pos[0]+this.rpos.width)){
			if(y>=pos[1] && y<=(pos[1]+this.rpos.height)){
				return true;
			}
		}
		return false;
	}
	this.update = function(){
		if(this.timing && this.clicked){
			this.time++;
			if(this.time>=this.maxtime){
				this.time=0;
				this.clicked = false;
			}
		}
	}
	this.isgood = function(){
		return true;
		if(this.waiting && (this.time>0)){
			return false;
		}
		return true;
	}
}
function textBox(pos,word,col=null,size=25){
	this.word=word;
	this.rpos = pos;
	this.textsize = size;
	this.col = col;
	this.color = "#484a4c";
	this.type = "Arial";
	
	this.draw = function(){
		//draw text
		can.fillStyle= this.color;
		can.textAlign = "center";
		can.textBaseline="middle";
		var s = this.textsize;
		if(this.col!= null){
			if(this.col.clicked){
				s+=3;
			}
		}
		
		can.font = (""+s+"px " +this.type);
		var mid = this.rpos.getmid();
		can.fillText(this.word, mid[0], mid[1]);
	}
}
function imageBox(pos,src,col=null){
	this.rpos = pos;
	this.col = col;
	this.img = new Image();
	this.src = src;
	this.added = false;
	this.dl=5;
	this.color = "gray";
	
	this.draw = function(){
		var pos = this.rpos.getpos();
		var x = pos[0];
		var y = pos[1];
		w = this.rpos.width;
		h = this.rpos.height;
		if(this.col!=null){
			if(this.col.clicked){
				x-=this.dl;
				y-=this.dl;
				w+=this.dl*2;
				h+=this.dl*2;
			}
		}
		//console.log(this.img.src);
		if(this.src=="up"){
			this.uparrow(x,y,w,h);
		}
		else if(this.src=="down"){
			this.downarrow(x,y,w,h);
		}
		else if(this.src == "play"){
			var points = this.scale([[x,y],[x,y+h],[x+w,y+h/2]],0.8,[x+w/2,y+h/2]);
			this.drawpoints(points);
		}
		else if(this.src == "pause"){
			var dx = w/8;
			var points = this.scale([[x+dx,y],[x+dx,y+h],[x+w/2-dx,y+h],[x+w/2-dx,y]],0.8,[x+w/2,y+h/2]);
			this.drawpoints(points);
			var nx = x +w/2;
			var points = this.scale([[nx+dx,y],[nx+dx,y+h],[nx+w/2-dx,y+h],[nx+w/2-dx,y]],0.8,[x+w/2,y+h/2]);
			this.drawpoints(points);
		}
		else{
			if(!this.added){
				this.img.src = src;
				this.added = true;
			}
			can.drawImage(this.img,x,y,w,h);
		}
		
	}
	
	this.downarrow = function(x,y,w,h){
		var points = this.scale([[x,y],[x+w/2,y+h],[x+w,y]],0.8,[x+w/2,y+h/2]);
		this.drawpoints(points);
	}
	this.uparrow = function(x,y,w,h){
		var points = this.scale([[x,y+h],[x+w/2,y],[x+w,y+h]],0.8,[x+w/2,y+h/2]);
		this.drawpoints(points);
	}
	this.scale = function(points,scale,cen=[pos[0]+this.rpos.width/2,pos[1]+this.rpos.height/2]){
		var ans = [];
		for(var i = 0;i<points.length;i++){
			var nx = ((points[i][0] -cen[0]) * scale) +cen[0];
			var ny = ((points[i][1] -cen[1]) * scale) +cen[1];
			ans.push([nx,ny]);
		}
		return ans;
	}
	this.drawpoints = function(points){
		can.fillStyle=this.color;
		can.beginPath();
		can.moveTo(points[0][0],points[0][1]);
		for(var i=1;i<points.length;i++){
			can.lineTo(points[i][0],points[i][1]);
		}
		can.closePath();
		can.fill();
	}
}
function drawer(i,pos,col=null){
	this.index =i;
	this.rpos = pos;
	this.col = col;
	this.color = "white";
	this.h_color = "#e1e4e8";
	this.dl = 5;
	this.div=5;
	this.hasedge = true;
	this.getparam = function(){
		var ans =[];
		var pos = this.rpos.getpos();
		ans.push(pos[0]);
		ans.push(pos[1]);
		ans.push(this.rpos.width);
		ans.push(this.rpos.height);
		if(this.col!=null){
			if(this.col.clicked){
				ans[0]-=this.dl;
				ans[1]-=this.dl;
				ans[2]+=this.dl*2;
				ans[3]+=this.dl*2;
			}
		}
		return ans;
	}
	//drawing functions
	this.Rect = function(x,y,w,h){
		can.beginPath();
		can.rect(x,y,w,h);
		can.closePath();
	}
	this.roundRect = function(x,y,w,h,r){
		can.beginPath();
		can.moveTo(x+r, y);
		can.arcTo(x+w, y,   x+w, y+h, r);
		can.arcTo(x+w, y+h, x,   y+h, r);
		can.arcTo(x,   y+h, x,   y,   r);
		can.arcTo(x,   y,   x+w, y,   r);
		can.closePath();
	}
	this.oval = function(x,y,w,h){
		can.beginPath();
		can.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,(2*Math.PI));
		can.closePath();
	}
	this.rightRect = function(x,y,w,h,r){
		can.beginPath();
		can.moveTo(x,y+r);
		can.arcTo(x,y,x+r,y,r);
		can.lineTo(x+w,y);
		can.lineTo(x+w,y+h);
		can.lineTo(x+r,y+h);
		can.arcTo(x,y+h,x,y+h-r,r);
		can.closePath();
	}
	this.leftRect = function(x,y,w,h,r){
		can.beginPath();
		can.moveTo(x+w,y+r);
		can.arcTo(x+w,y,x+w-r,y,r);
		can.lineTo(x,y);
		can.lineTo(x,y+h);
		can.lineTo(x+w-r,y+h);
		can.arcTo(x+w,y+h,x+w,y+h-r,r);
		can.closePath();
	}
	this.draw = function(){
		can.fillStyle=this.color;
		can.strokeStyle = "#6f7072";
		if(this.col!=null){
			if(this.col.highlighted || this.col.clicked){
				can.fillStyle=this.h_color;
			}	
		}
		var param = this.getparam();
		var r = this.rpos.height/this.div;
		//can.rect(this.pos[0],this.pos[1],this.width,this.height);
		if(this.index==0){
			this.Rect(param[0],param[1],param[2],param[3]);
		}
		if(this.index==1){
			this.roundRect(param[0],param[1],param[2],param[3],r);
		}
		if(this.index==2){
			this.oval(param[0],param[1],param[2],param[3]);
		}
		if(this.index==3){
			this.rightRect(param[0],param[1],param[2],param[3],r);
		}
		if(this.index==4){
			this.leftRect(param[0],param[1],param[2],param[3],r);
		}
		can.fill();
		if(this.hasedge){
			can.stroke();
		}
	}
}

