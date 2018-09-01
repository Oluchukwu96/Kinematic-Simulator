function gear(po,tno=30){
	//variables
	this.pos = po;
	this.type = "gear";
	var myvec = new vec();
	this.teethno = tno;
	this.size = 25;
	this.ratio = 0.5;
	this.color ="#84888e";
	this.angle = 0;
	this.da = 0;
	this.connections = [];
	this.rotated = false;
	this.pos.gear = this;
	this.points = []; // array of points connected to shape
	//functions
	this.parameter = function(){
		return (this.size * this.teethno);
	}
	this.radius = function(){
		return this.parameter()/(2*Math.PI);
	}
	//roation variables
	this.clear = function(){
		this.rotated = false;
		for(var i = 0;i<this.connections.length;i++){
			if(this.connections[i].rotated){
				this.connections[i].clear();
			}
		}
	}
	//rotate all connected gears
	this.rotate = function(da){
		this.clear();
		this.rotateall(da);
		this.clear();
	}
	this.rotateall = function(da){
		this.rotated = true;
		for(var i = 0;i<this.connections.length;i++){
			if(!this.connections[i].rotated){
				var before = this.connections[i].pos.angle;
				this.connections[i].surfmove(this.getsmove(-da));
				this.connections[i].rotatekids(-da);
				var after = this.connections[i].pos.angle;
				//console.log("New da is "+(after-before));
				this.connections[i].rotateall(after-before);
			}
		}
	}
	//rotate all points connected to it
	this.rotatekids = function(da){
		this.pos.shortrotate(da);
		this.pos.clear();
		//neighbors values are constant
		for(var i=0;i<this.pos.connections.length;i++){
			if(!this.pos.connections[i].rotated){
				this.pos.connections[i].rotated=true;
				this.pos.connections[i].giveconstraint();
			}
		}
	}
	this.gearcollide = function(g){
		var dist = myvec.length(this.pos.getpoint(),g.pos.getpoint());
		if(dist<=(this.radius()+g.radius())+0.001){
			return true;
		}
		return false;
	}
	//move all connected gears
	this.checkconnect = function(g){
		this.rotated = true;
		if(this.gearcollide(g)){
			g.connections.push(this);
			this.connections.push(g);
			this.connect(g);
			g.push();
		}
		this.clear();
	}
	this.push = function(){
		this.rotated = true;
		for(var i = this.connections.length-1;i>=0;i--){
			if(!this.connections[i].rotated){
				if(this.gearcollide(this.connections[i])){
					this.connect(this.connections[i]);
					this.connections[i].push();
				}
				else{
					this.connections[i].remove(this);
					this.remove(this.connections[i]);
				}
			}
		}
		//this.clear();
	}
	//remove a gear from a connection
	this.remove = function(g){
		var newc = [];
		for(var i = 0;i<this.connections.length;i++){
			if(this.connections[i]===g){
				var no =1;
			}
			else{
				newc.push(this.connections[i]);
			}
		}
		this.connections = newc;
	}
	this.removeall = function(){
		for(var i = this.connections.length-1;i>=0;i--){
			this.connections[i].remove(this);
			this.remove(this.connections[i]);
		}
	}
	//end
	this.pos.visible = false;
	this.pos.r = this.radius();
	//get a point on the surface of the gear
	this.getpoint = function(an,d=0){
		var ve = myvec.getvec(this.radius()+d,an);
		var ans = myvec.add(this.pos.getpoint(),ve);
		return ans;
	}
	this.dangle = function(){
		return ((2*Math.PI)/this.teethno);
	}
	this.drawteeth = function(an,dr){
		var po = this.pos.getpoint();
		po = mech.toscreen(po);
		var r = this.radius();
		var ean = an + this.dangle();
		can.arc(po[0],po[1],(r+dr)*mech.scale,an,ean);
		
	}
	this.adjust = function(p1,p2){
		var nr = myvec.length(this.pos.getpoint(),p2);
		var tno = this.getteethno(nr);
		this.teethno = this.makeeven(tno);
		this.pos.r = this.radius();
	}
	this.edgecollide = function(p){
		var tol = 5;
		var leng = myvec.length(p,this.pos.getpoint());
		if(Math.abs(leng - this.radius())<=tol){
			return true;
		}
		return false;
	}
	this.update = function(p){
		this.pos.update(p);
	}
	this.makeeven = function(no){
		no/=2;
		no = Math.round(no);
		return (no*2);
	}
	this.getteethno = function(r){
		var ans = (r * (2*Math.PI))/this.size;
		return ans;
	}
	this.collide = function(p){
		return this.pos.collide(p);
	}
	this.surfmove = function(ds){
		da = ds/this.radius();
		this.pos.angle+=da;
	}
	//get surface move
	this.getsmove = function(da){
		ds = da * this.radius();
		return ds;
	}
	//move the other gear to you
	this.connect = function(g){
		var idl = (this.radius() + g.radius());
		var dist = myvec.length(g.pos.getpoint(),this.pos.getpoint());
		dist -=idl;
		var mv = myvec.getvec(dist,myvec.angle(g.pos.getpoint(),this.pos.getpoint()));
		g.move(mv[0],mv[1]);
		//this.pos.angle = myvec.angle(this.pos.getpoint(),g.pos.getpoint());
		var oth = myvec.angle(this.pos.getpoint(),g.pos.getpoint())-this.pos.angle;
		g.pos.angle = myvec.angle(g.pos.getpoint(),this.pos.getpoint());
		g.surfmove(this.getsmove(oth));
	}
	this.move = function(dx,dy){
		this.pos.move(dx,dy);
	}
	this.drawcenter = function(){
		var po = this.pos.getpoint();
		po = mech.toscreen(po);
		var r = this.radius()*0.25*mech.scale;
		can.arc(po[0],po[1],r,0,2*Math.PI);
	}
	this.draw = function(){
		var an = this.pos.angle;
		can.fillStyle = this.color;
		can.strokeStyle = "black";
		if(this.pos.selected){
			can.fillStyle = "#c2c9d3";
		}
		can.beginPath();
		this.drawcenter();
		var dm = this.getpoint(an);
		dm = mech.toscreen(dm);
		can.moveTo(dm[0],dm[1]);
		var da = 5;
		for(var i =0;i<this.teethno;i++){
			this.drawteeth(an,da);
			da*=-1;
			an+=this.dangle();
		}
		can.closePath();
		can.fill();
		can.stroke();
		/*
		can.beginPath();
		this.drawcenter();
		can.closePath();
		can.stroke();
		*/
	}
}

































