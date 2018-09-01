
function line(p1,p2,dir=1){
	var myvec = new vec();
	//variables
	this.p1 = p1;
	this.p2 = p2;
	this.type = "line";
	this.index = 1;
	this.dir = dir; //either 1 or 2
	//initialize
	this.initlength = myvec.length(p1.getpoint(),p2.getpoint());
	//functions
	this.getvec = function(){
		P1=this.p1.getpoint();
		P2 =this.p2.getpoint();
		return [P2[0]-P1[0],P2[1]-P1[1]];
	}
	this.getangle = function(){
		return myvec.getangle(this.getvec());
	}
	this.P1 = function(){
		return this.p1.getpoint();
	}
	this.P2 = function(){
		return this.p2.getpoint();
	}
	//pushing a line
	this.push = function(p1,p2){
		var an = myvec.getangle(myvec.subtract(p2,p1));
		console.log(an);
		this.face(an);
	}
	this.check = function(){
		var diff = this.initlength - this.length();
		if(Math.abs(diff)>0.01){
			return false;
		}
		return true;
	}
	this.face = function(angle){
		var nv = myvec.getvec(this.initlength,angle);
		var np2 = myvec.add(nv,this.P1());
		this.p2.update(np2);
	}
	//get the distance between two points 
	this.length = function(){
		x = Math.abs(this.P2()[0]-this.P1()[0]);
		y = Math.abs(this.P2()[1]-this.P1()[1]);
		ans = Math.pow(x,2)+Math.pow(y,2);
		ans = Math.pow(ans,0.5);
		return ans;
	}
	this.shortdistance = function(p){
		ret = this.facingdistance(p);
		//is the ans with the boundaries of the line
		if(p1[0]>=this.P1()[0] && p1[0]<=(this.P1()[0]+this.length())){
			return ret;
		}
		return null;
	}
	this.rayshoot = function(p,v=[1,1.01]){
		var pos = new point(p[0],p[1]);
		var newl = new line(pos.copy(),pos.addto(v));
		var ans = this.intersect(newl);
		if(newl.isfacing(ans) && this.isInside(ans)){
			return true;
		}
		return false;
	}
	this.shortestpoint = function(pos){
		var an = this.getangle() +(Math.PI/2);
		var v = myvec.getvec(1,an);
		var newl = new line(pos.copy(),pos.addto(v));
		var p = this.doubleshoot(newl);
		//console.log(p);
		return p;
	}
	this.copy = function(){
		return new line(this.p1.copy(),this.p2.copy());
	}
	this.move = function(v){
		this.p1.move(v[0],v[1]);
		this.p2.move(v[0],v[1]);
	}
	
	this.facingdistance = function(p){
		p1 =p.getpoint();
		//rotate point
		pv =myvec.subtract(p1,this.P1());
		pv =myvec.rot(pv,-myvec.getangle(this.getvec()));
		p1= myvec.add(this.P1(),pv);
		return (p1[1]-this.P1()[1]);
	}
	this.isFacing = function(p){
		distance = this.facingdistance(p);
		if(distance==null){
			return false;
		}
		if(this.dir == 1 && distance>=0){
			return true;
		}
		if(this.dir == 2 && distance<=0){
			return true;
		}
		return false;
	}
	
	//Extra Stuff
	this.shoot = function(line){
		var ans = this.intersect(line);
		var tp = new point(ans[0],ans[1]);
		//return ans;
		if(this.isfacing(tp) && line.isInside(ans)){
			return ans;
		}
		return null;
	}
	//infinite line in both direction
	this.doubleshoot = function(l){
		var ans = this.intersect(l);
		return ans;
		if(l.isInside(ans)){
			return ans;
		}
		return null;
	}
	//collision functions
	this.calparam=function(p1,p2){
		var dinum=p2[0]-p1[0];
		//prevent the zero error
		if(dinum===0){
			dinum=0.000001;
		}
		var m=(p2[1]-p1[1])/dinum;
		var c= p1[1] -(m*p1[0]);
		return [m,c];
	}
	this.intersect=function(line){
		var C1=this.calparam(this.p1.getpoint(),this.p2.getpoint());
		var C2=this.calparam(line.p1.getpoint(),line.p2.getpoint());
		var g=C2[0]-C1[0];
		if(g===0){
			g=0.00001;
		}
		var x=(C1[1]-C2[1])/g;
		var y=(C1[0]*x)+C1[1];
		var ans = [x,y];
		return ans;
	}
	//booleans for checking point positions
	this.isInside=function(p){
		var p1 = this.p1.getpoint();
		var p2 = this.p2.getpoint();
		if(myvec.length(p1,p)==0 || myvec.length(p2,p)==0){
			return true;
		}
		if(Math.abs(myvec.angle(p1,p2)-myvec.angle(p1,p))<0.01){
			if(Math.abs(myvec.angle(p2,p1)-myvec.angle(p2,p))<0.01){
				return true;
			}
		}
		return false;
	}
	this.isfacing=function(p){
		var p1 = this.p1.getpoint();
		var p2 = this.p2.getpoint();
		if(myvec.length(p1,p)==0 || myvec.length(p2,p)==0){
			return true;
		}
		if(Math.abs(myvec.angle(p1,p2)-myvec.angle(p1,p))<0.01){
			return true;
		}
		return false;
	}
	//draw the line
	this.draw=function(c="#000000"){
		var p1 = this.p1.getpoint();
		var p2 = this.p2.getpoint();
		p1 = mech.toscreen(p1);
		p2 = mech.toscreen(p2);
		can.strokeStyle=c;
		can.beginPath();
		can.lineWidth=2;
		can.moveTo(p1[0],p1[1]);
		can.lineTo(p2[0],p2[1]);
		can.stroke();
		can.closePath();
   }
}

