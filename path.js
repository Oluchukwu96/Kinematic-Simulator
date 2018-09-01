function path(p1,p2){
	this.p1 = p1;
	this.p2 = p2;
	this.type = "path";
	this.line = new line(p1,p2);
	this.joints =[this.p1,this.p2];
	this.width = p1.diameter();
	this.selected = false;
	this.points = [p1,p2];
	var myvec = new vec();
	
	this.p1.pathpoint = true;
	this.p2.pathpoint = true;
	
	this.p1.pathself = this;
	this.p2.pathself = this;
	//functions
	this.collide = function(p){
		var po = new point(p[0],p[1]);
		var np = this.line.shortestpoint(po);
		if(np!=null){
			if(myvec.length(np,p)<=this.width/2 && this.line.isInside(np)){
				return true;
			}
		}
		return false;
	}
	//restriction functions
	this.join = function(po){
		if(po.shape == null){
			//this.points.push(po);
			po.path = this.line;
			po.pathparent = this;
			this.align(po);
			//this.p1.pathchild = po;
		}
	}
	this.check = function(){
		return true;
	}
	this.ischild = function(){
		for(var i =0;i<this.points.length;i++){
			if(this.points[i].shape == null){
				return false;
			}
		}
		return true;
	}
	this.Delete = function(){
		this.p1.removeboth(this.p2);
	}
	this.allrotated = function(){
		for(var i =0;i<this.points.length;i++){
			if(!this.points[i].rotated){
				return false;
			}
		}
		return true;
	}
	this.move = function(dx,dy,mec = null){
		for(var i =0;i<this.points.length;i++){
			this.points[i].move(dx,dy);
			if(mec!=null){
				mec.jointdrag(this.points[i]);
			}
		}
	}
	this.getother = function(){
		
	}
	this.adjustself = function(p){
		var ans = this.getrotated();
		if(ans!=null){
			var an = myvec.angle(ans.getpoint(),p.getpoint());
			for(var i =0;i<this.points.length;i++){
				var leng = myvec.length(ans.getpoint(),this.points[i].getpoint());
				var vect = myvec.getvec(leng,an);
				var newv = myvec.add(ans.getpoint(),vect);
				this.points[i].update(ans);
			}
		}
		
	}
	this.getrotated = function(){
		for(var i=0;i<this.points.length;i++){
			var ans = this.points[i].getrotated();
			if(ans!=null){
				return ans;
			}
		}
		return null;
	}
	this.adjust = function(p){
		var np = this.line.shortestpoint(p);
		var vec = myvec.subtract(np,p.getpoint());
		if(!this.line.isInside(np)){
			vec = myvec.add(this.moveto(np),vec);
		}
		return vec;
	}
	this.moveto = function(p){
		var ans =[0,0];
		var dist =null;
		for(var i=0;i<this.points.length;i++){
			var leng = myvec.length(p,this.points[i].getpoint());
			if(dist==null || dist>leng){
				dist = leng;
				ans = myvec.subtract(this.points[i].getpoint(),p);
			}
		}
		return ans;
	}
	// align joint to path
	this.align = function(j){
		var vec = this.adjust(j);
		j.move(vec[0],vec[1]);
	}
	//end
	this.getpoints = function(){
		var ans = [];
		var diff = Math.PI/2;
		if(this.joints.length>2){
			diff = this.getdiff();
		}
		for(var i=0;i<this.joints.length;i++){
			var j = this.joints[this.getnext(i)];
			var an = myvec.angle(this.joints[i].getpoint(),j.getpoint());
			var dm = myvec.getvec(this.width/2,an+diff);
			var n1 = this.joints[i].copy();
			var n2 = j.copy();
			n1.move(dm[0],dm[1]);
			n2.move(dm[0],dm[1]);
			ans.push(n1.getpoint());
			ans.push(n2.getpoint());
			//diff-= Math.PI;
		}
		return ans;
	}
	this.getnext = function(i,leng = this.joints.length ){
		if(i>=leng-1){
			return 0;
		}
		return i+1;
	}
	this.scalepoints = function(points){
		var ans =[];
		for(var i=0;i<points.length;i++){
			ans.push(mech.toscreen(points[i]));
		}
		return ans;
	}
	this.draw = function(){
		can.fillStyle="white";
		can.strokeStyle = "black";
		if(this.selected){
			can.fillStyle=="white";
			can.strokeStyle = "yellow";
		}
		var points = this.getpoints();
		points = this.scalepoints(points);
		this.drawpoints(points);
		can.stroke();
		this.drawjoints(false);
		this.drawpoints(points);
		can.fill();
		this.drawjoints();
		this.line.draw();
	}
	this.drawpoints = function(points){
		can.beginPath();
		can.moveTo(points[0][0],points[0][1]);
		//console.log(points[0][1]);
		for(var i=1;i<points.length;i++){
			can.lineTo(points[i][0],points[i][1]);
		}
		can.closePath();
		
	}
	this.oval = function(x,y,w,h){
		can.beginPath();
		can.ellipse(x,y,w/2,h/2,0,0,(2*Math.PI));
		can.closePath();
	}
	this.drawjoints = function(f = true){
		for(var i=0;i<this.joints.length;i++){
			var pos = this.joints[i].getpoint();
			pos = mech.toscreen(pos);
			this.oval(pos[0],pos[1],this.width*mech.scale,this.width*mech.scale);
			if(f){
				can.fill();
			}
			else{
				can.stroke();
			}
			
		}
	}
}































