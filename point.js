function point(x,y,base=null){
	this.origin=base;
	this.type = "point";
	this.x=x;
	this.y=y;
	this.avel = 0;
	this.angle=0;
	this.path = null; // The restricted path the point can follow
	this.gear = null; // is point the origin of a gear
	this.pushing = false;
	this.shape = null; // is the point connected to a shape
	this.color = "blue";
	this.selected = false;
	//new variables
	var myvec = new vec();
	this.connections = []; //store other points that we are connected to
	this.lengths =[]; //the lengths of points to be connected to
	//variables for calculating positions
	this.constraints =[];
	this.solved = false;
	//Boolean Variables
	this.isStatic = false;
	this.rotated = false;
	this.pos = [];
	this.visible = true;
	this.pathpoint = false; // does this point represent a path
	this.pathparent = null;
	this.pathchild = null;
	this.pathself = null;
	this.r = 20;
	//rotation functions
	//add double connection between two points
	this.connect =function(po){
		//calculate lengths
		var p1 = this.getpoint();
		var p2 = po.getpoint();
		var l = myvec.length(p1,p2);
		//add connections
		this.connections.push(po);
		po.connections.push(this);
		//add lengths
		this.lengths.push(l);
		po.lengths.push(l);
	}
	this.norm = function(l1,l2,p1,p2){
		var vl = myvec.subtract(l2,l1);
		var vp = myvec.subtract(p2,p1);
		var an = myvec.getangle(vl); 
		var newvp = this.rot(vp[0],vp[1],-an);
		return newvp;
	}
	//get the lenght of a particular connection
	this.conlength = function(j){
		for(var i = 0;i<this.connections.length;i++){
			if(j=== this.connections[i]){
				return this.lengths[i];
			}
		}
		return 0;
	}
	this.calibrate = function(){
		var store = this.connections;
		this.removeall();
		this.connectall(store);
	}
	this.getrotated = function(){
		for(var i=0;i<this.connections.length;i++){
			if(this.connections[i].rotated){
				return this.connections[i];
			}
		}
		return null;
	}
	//Remove connection from point
	this.remove = function(po){
		var newc = [];
		var newl = [];
		for(var i = 0;i<this.connections.length;i++){
			if(this.connections[i]===po){
				var no =1;
			}
			else{
				newc.push(this.connections[i]);
				newl.push(this.lengths[i]);
			}
		}
		this.connections = newc;
		this.lengths = newl;
	}
	this.removeboth = function(p){
		p.remove(this);
		this.remove(p);
	}
	//delete all connections
	this.removeall = function(){
		for(var i = this.connections.length-1;i>=0;i--){
			this.removeboth(this.connections[i]);
		}
	}
	//rotating neighbors
	this.isstill = function(){
		if(this.isStatic || !this.visible){
			return true;
		}
		return false;
	}
	//add all points to connections
	this.connectall = function(points){
		for(var i=0;i<points.length;i++){
			this.connect(points[i]);
		}
	}
	this.rotateconnect = function(p1,p2){
		for(var i = this.connections.length-1;i>=0;i--){
			if(this.connections[i].isstill){
				var a1 = myvec.angle(this.connections[i].getpoint(),p1);
				var a2 = myvec.angle(this.connections[i].getpoint(),p2);
				var da = (a2-a1);
				if(!isNaN(da)){
					this.connections[i].angle += da;
					if(this.connections[i].gear!=null){
						this.connections[i].gear.rotate(da);
					}
				}
			}
			
		}
		
		
	}
	this.staylinked = function(p){
		this.rotated = true;
		this.face(p);
		var dmove = myvec.subtract(p,this.getpoint());
		var former = this.getpos();
		this.move(dmove[0],dmove[1]);//update the position
		for(var i=0;i<this.connections.length;i++){
			if(this.connections[i].rotated){
				var sub = myvec.subtract(this.connections[i].getpoint(),former);
				var newpos = myvec.add(this.getpos(),sub);
				this.connections[i].staylinked(newpos);
			}
		}
	}
	this.guess = function(){
		for(var i=0;i<this.connections.length;i++){
			if(!this.check(i)){
				var po = this.connections[i].getpoint();
				var mpo = this.getpoint();
				var an = myvec.getangle(myvec.subtract(mpo,po));
				var nv = myvec.getvec(this.lengths[i],an);
				var np = myvec.add(nv,po);
				this.update(np);
				
				//ending remarks
				this.rotated = true;
				this.giveconstraint();
				return true;
			}
		}
		return false;
	}
	//ensure no deviation in length
	this.check = function(i){
		var leng = myvec.length(this.connections[i].getpoint(),this.getpoint());
		var diff = this.lengths[i] - leng;
		if(Math.abs(diff)>0.01){
			return false;
		}
		return true;
	}
	//another one
	this.newrotate = function(da){
		this.rotated = true;
		for(var i=0;i<this.connections.length;i++){
			if(!this.connections[i].rotated){
				po = myvec.subtract(this.connections[i].getpoint(),this.getpoint());
				var a = this.rot(po[0],po[1],da);
				a = myvec.add(a,this.getpoint());
				//this.connections[i].update(ans);
				this.connections[i].followall(a);
			}
		}
		this.clear();
	}
	this.addconstraint = function(po,length){
		//alert("The point is "+po.getpoint());
		var co = new circle(po.getpoint(),length);
		this.constraints.push(co);
		//alert("co "+this.constraints[0]);
	}
	this.giveconstraint = function(){
		for(var i=0;i<this.connections.length;i++){
			if(!this.connections[i].rotated){
				this.connections[i].addconstraint(this,this.lengths[i]);
			}
		}
	}
	//rotate only the points conected to it
	this.shortrotate = function(da){
		for(var i=0;i<this.connections.length;i++){
			if(!this.connections[i].isStatic){
				this.connections[i].rotateabout(this,da);
			}
		}
		
	}
	//rotate all connections about an angle
	this.rotate = function(da){
		this.rotated = true; //no self rotation
		//rotate neighbors
		for(var i=0;i<this.connections.length;i++){
			this.rotateabout(this,da);
		}
		//clear all rotations
		this.clear();
		
	}
	this.rotateAbout = function(po,da){
		this.rotated = true
		var diff = myvec.subtract(this.getpoint(),po.getpoint());
		var ans = this.rot(diff[0],diff[1],da);
		var val = myvec.add(ans,po.getpoint());
		this.update(val);
		this.evalpos();
		//rotate neighbors
		for(var i=0;i<this.connections.length;i++){
			if(!this.connections[i].rotated){
				this.connections[i].addconstraint(this,this.lengths[i]);
				this.connections[i].rotateAbout(po,da);
			}
		}
	}
	//rotate just the point
	this.rotateabout = function(po,da){
		//this.rotated = true
		var diff = myvec.subtract(this.getpoint(),po.getpoint());
		var ans = this.rot(diff[0],diff[1],da);
		var val = myvec.add(ans,po.getpoint());
		this.update(val);
		//this.evalpos();
	}
	//calculate its position from constraints
	this.evalpos = function(){
		if(this.path!=null && this.constraints.length==1){
			var c1 = this.constraints[0];
			var sols = c1.linepoints(this.path);
			var ans = this.getclose(this.getpoint(),sols);
			var p1 = this.getpoint();
			this.update(ans);
			this.rotateconnect(p1,this.getpoint());
		}
		else if(this.constraints.length>1){
			var c1 = this.constraints[0];
			var c2 = this.constraints[1];
			var sols = c1.colpoints(c2);
			var ans = this.getclose(this.getpoint(),sols);
			var p1 = this.getpoint();
			this.update(ans);
			this.rotateconnect(p1,this.getpoint());
		}
	}
	this.getclose = function(pos,sols){
		var ans = myvec.mag(myvec.subtract(pos,sols[0]));
		var ret = sols[0];
		for(var i=1;i<sols.length;i++){
			var diff = myvec.mag(myvec.subtract(pos,sols[i]));
			if(diff<ans){
				ans = diff;
				ret = sols[i];
			}
		}
		return ret;
	}
	//radical changing
	this.rotatewell = function(){
		
	}
	this.getpoints = function(ls = []){
		this.rotate = true;
		ls.push(this.getpos);
		
	}
	//rotation has occured
	this.clear = function(){
		this.rotated = false;
		this.pos=[];
		this.constraints =[];
		for(var i=0;i<this.connections.length;i++){
			if(this.connections[i].rotated){
				this.connections[i].clear();
			}
		}
	}
	//add contraints
	this.constraint = function(){
		this.rotated = true;
		this.adjust();
		this.clear();
		
	}
	//put all points back to normal
	this.adjust =function(){
		if(this.pos.length>0){
			var former = this.getpos();
			var current = this.pos;
			//alert("Current is "+current)
			this.pos=[];
			this.rotated=true;
			for(var i=0;i<this.connections.length;i++){
				if(!this.connections[i].rotated){
					var cpos = this.connections[i].getpos();
					var clength = myvec.length(former,cpos);
					//get angle
					var avec = myvec.minus(cpos,current);
					var an = myvec.getangle(avec);
					//adjust position
					var dv = myvec.getvec(clength,an);
					//alert(myvec.add(dv,cpos));
					this.connections[i].pos = myvec.add(dv,cpos);
					this.connections[i].adjust();
				}
			}
			this.update(current);
		}
	}
	this.goodface = function(p){
		for(var i=0;i<this.connections.length;i++){
			if(!this.connections[i].rotated){
				this.face(p,i);
			}
		}
	}
	//look at a point
	this.face = function(p,i=0){
		if(this.connections.length>i){
			//alert("p1 is "+this.connections[0].getpoint());
			//alert("p2 is "+this.getpoint());
			var avec = myvec.subtract(p,this.connections[i].getpoint());
			var an = myvec.getangle(avec);
			var clength = myvec.length(this.connections[i].getpoint(),this.getpoint());
			var dv = myvec.getvec(clength,an);
			var newpos = myvec.add(this.connections[i].getpoint(),dv);
			this.newupdate(newpos);
			//alert("the length is "+this.getpoint());
		}
	}
	//move to a point
	this.moveto = function(p){
		var diff = myvec.subtract(p,this.getpoint());
		this.move(diff[0],diff[1]);
	}
	//move points and its connections by a certain distance
	this.moveall = function(v){
		this.rotated = true;
		this.move(v[0],v[1]);
		for(var i=0;i<this.connections.length;i++){
			if(!this.connections[i].rotated){
				this.connections[i].moveall(v);
			}
		}
	}
	//move point towards a point
	this.moveallto = function(p){
		var diff = myvec.subtract(p,this.getpoint());
		this.moveall(diff);
	}
	//recursively follow
	this.followall = function(p,i=0){
		this.rotated = true;
		//this.face(p,i);
		this.goodface(p);
		var dmove = myvec.subtract(p,this.getpoint());
		var former = this.getpos();
		this.move(dmove[0],dmove[1]);//update the position
		for(var i=0;i<this.connections.length;i++){
			if(!this.connections[i].rotated){
				var sub = myvec.subtract(this.connections[i].getpoint(),former);
				var newpos = myvec.add(this.getpos(),sub);
				this.connections[i].followall(newpos);
			}
		}
	}
	//follow a point
	this.follow = function(p){
		this.face(p);
		this.moveto(p);
	}
	this.newupdate = function(p){
		if(this.origin==null){
			this.update(p);
		}
		else{
			var ans = myvec.subtract(p,this.origin.getpoint());
			this.update(p);
		}
		
	}
	//remove parameter from self
	this.minus = function(po){
		p1 = po.getpoint();
		sp = this.getpoint();
		var X = sp[0]-p1[0];
		var Y = sp[1]-p1[1];
		return [X,Y];
	}
	//update point coordinates
	this.update = function(ans){
		this.x = ans[0];
		this.y = ans[1];
	}
	
	
	//main functions
	this.rot=function(x,y,angle){
		var X=x*Math.cos(angle) -y*Math.sin(angle);
		
		var Y=y*Math.cos(angle) +x*Math.sin(angle);
		return [X,Y];
	}
	//get angle
	this.getangle =function(){
		if(this.origin==null){
			return this.angle;
		}
		return (this.angle + this.origin.getangle());
	}
	//make this point the origin of the parameter
	this.addorigin = function(p){
		p.origin = this;
	}
	//replace add origin to the last origin recursively
	this.pushorigin = function(p){
		if(this.origin == null){
			this.origin = p;
		}
		else{
			this.origin.pushorigin(p);
		}
		
	}
	//GUI functions
	this.oval = function(x,y,w,h){
		can.beginPath();
		can.ellipse(x,y,w/2,h/2,0,0,(2*Math.PI));
		can.closePath();
	}
	this.collide = function(p){
		var pos = this.getpoint();
		if(myvec.length(pos,p)<=this.r){
			return true;
		}
		return false;
	}
	this.draw = function(){
		if(this.visible){
			can.fillStyle=this.color;
			can.strokeStyle = "gray";
			if(this.selected){
				can.fillStyle = "yellow";
			}
			if(this.pathpoint){
				can.fillStyle = "black";
				can.strokeStyle = "black";
			}
			var pos = this.getpoint();
			pos = mech.toscreen(pos);
			if(this.pathpoint){
				this.oval(pos[0],pos[1],5*mech.scale,5*mech.scale);
			}
			else{
				this.oval(pos[0],pos[1],2*this.r*mech.scale,2*this.r*mech.scale);
			}
			can.fill();
			can.stroke();
		}
	}
	this.diameter = function(){
		return (2*this.r);
	}
	//end
	//get the coordinates of the point
	this.getpoint = function(){
		ans = [this.x,this.y];
		
		if(this.origin!=null){
			//rotate about origin
			ans = this.rot(this.x,this.y,this.origin.getangle());
			//increment relative to origin
			ans = this.add(ans,this.origin.getpoint());
		}
		return ans;
	}
	//get the cordinate of the point from the origin
	this.getpos = function(){
		return [this.x,this.y];
	}
	//return current position as a class
	this.copy = function(){
		var po = this.getpoint();
		return new point(po[0],po[1]);
	}
	//return the sum of the point and vector
	this.addto = function(v){
		return new point(this.getpoint()[0]+v[0],this.getpoint()[1]+v[1]);
	}
	//move the points position
	this.move = function(dx,dy){
		this.x+=dx;
		this.y+=dy;
	}
	//add two vectors
	this.add = function(v1,v2){
		ans=[];
		for(var i=0;i<v1.length;i++){
			ans.push(v1[i]+v2[i]);
		}
		return ans;
	}
}





