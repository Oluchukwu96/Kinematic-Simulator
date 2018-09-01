function linkage(groups){
	this.scale = 3; // ratio between link width and joint width
	this.width=0;
	this.selected = false;
	this.edges = [];
	this.joints =[];
	this.color = "#84888e";
	this.type = "link";
	var myvec = new vec();
	
	for(var i=0;i<groups.length;i++){
		this.joints.push(groups[i]);
		if(groups[i].diameter()>this.width){
			this.width = groups[i].diameter();
			//console.log(groups[i].diameter());
		}
	}
	this.width*=this.scale;
	//Add connections
	for(var a=0;a<this.joints.length-1;a++){
		for(var b = a+1; b<this.joints.length;b++){
			this.joints[a].connect(this.joints[b]);
		}
	}
	//Ensure the same length is always maintained
	this.check = function(){
		for(var a=0;a<this.joints.length-1;a++){
			for(var b = a+1; b<this.joints.length;b++){
				var diff = this.joints[a].conlength(this.joints[b]) - myvec.length(
				this.joints[a].getpoint(),this.joints[b].getpoint());
				if(Math.abs(diff)>0.01){
					return false;
				}
			}
		}
		return true;
	}
	this.Delete = function(){
		for(var a=0;a<this.joints.length-1;a++){
			for(var b = a+1; b<this.joints.length;b++){
				this.joints[a].removeboth(this.joints[b]);
			}
		}
	}
	//move
	this.move = function(dx,dy,mec = null){
		for(var i =0;i<this.joints.length;i++){
			this.joints[i].move(dx,dy);
			if(mec!=null){
				mec.jointdrag(this.joints[i]);
			}
		}
	}
	this.ischild = function(){
		return false;
	}
	//attaching functions
	this.connect = function(j){
		for(var i=0;i<this.joints.length;i++){
			this.joints[i].connect(j);
		}
	}
	this.removeboth = function(j){
		for(var i=0;i<this.joints.length;i++){
			this.joints[i].removeboth(j);
		}
	}
	this.contains = function(j){
		for(var i=0;i<this.joints.length;i++){
			if(this.joints[i] === j){
				return true;
			}
		}
		return false;
	}
	//functions
	this.addjoints = function(j){
		unique = true;
		for(var i=0;i<this.joints.length;i++){
			if(j===this.joints[i]){
				unique = false;
			}
		}
		if(unique){
			if(j.diameter()>this.width/this.scale){
				this.width = j.diameter()*this.scale;
			}
			this.joints.push(j);
		}
		
	}
	this.checkWidth = function(w){
		for(var i=0;i<this.joints.length;i++){
			if(this.joints[i].diameter()>=w){
				return false;
			}
		}
		return true;
	}
	this.getnext = function(i,leng = this.joints.length ){
		if(i>=leng-1){
			return 0;
		}
		return i+1;
	}
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
	this.getdiff = function(){
		var a=0;
		var b=0;
		var c = this.center();
		c = new point(c[0],c[1]);
		for(var i=0;i<this.joints.length;i++){
			var j = this.joints[this.getnext(i)];
			var tl = new line(this.joints[i],j);
			var po = tl.shortestpoint(c);
			if(po!=null){
				var A = myvec.angle(this.joints[i].getpoint(),j.getpoint());
				var an = myvec.angle(po,c.getpoint());
				if(an-A>0){
					a++;
				}
				else{
					b++;
				}
			}
		}
		if(a>=b){
			return -Math.PI/2;
		}
		return Math.PI/2;
	}
	this.collide = function(p){
		var count = 0;
		var points = this.getpoints();
		for(var i=0;i<points.length;i++){
			var npo = points[this.getnext(i,points.length)];
			var tl = new line(new point(points[i][0],points[i][1]),new point(npo[0],npo[1]));
			if(tl.rayshoot(p,[1.001,0.102])){
				count++;
			}
		}
		if(count%2 == 1){
			return true;
		}
		return false;
	}
	this.center = function(){
		var sum = [0,0];
		for(var i=0;i<this.joints.length;i++){
			var pos = this.joints[i].getpoint();
			sum[0]+=pos[0];
			sum[1]+=pos[1];
		}
		return [sum[0]/this.joints.length,sum[1]/this.joints.length];
	}
	this.draw = function(){
		can.fillStyle=this.color;
		can.strokeStyle = "black";
		if(this.selected){
			can.fillStyle="#bcbfc4"
		}
		var points = this.getpoints();
		points = this.scalepoints(points);
		this.drawpoints(points);
		can.stroke();
		this.drawjoints(false);
		this.drawpoints(points);
		can.fill();
		this.drawjoints();
		
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
	this.scalepoints = function(points){
		var ans =[];
		for(var i=0;i<points.length;i++){
			ans.push(mech.toscreen(points[i]));
		}
		return ans;
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
	this.getangles = function(){
		var ans =[];
		for(var i=0;i<this.joints.length;i++){
			var pos = this.joints[i].getpoint();
		}
	}
	this.rayshoot = function(pos,v,p1,p2){
		var po =[pos[0]+v[0],pos[1]+v[1]];
		var ans = this.intersect(pos,po,p1,p2);
		if(this.angleCheck(pos,po,ans) && this.inline(ans,p1,p2)){
			return true;
		}
		return false;
	}
	//function to check if a point is in a line
	this.inline = function(p,p1,p2){
		if(this.angleCheck(p1,p2,p) && this.angleCheck(p2,p1,p)){
			return true;
		}
		return false;
	}
	//line intersection functions
	this.intersect = function(p1,p2,p3,p4){
		C1 = this.calparam(p1,p2);
		C2 = this.calparam(p3,p4);
		g = C2[0] - C1[0];
		//remove singularity
		if(g == 0){
			g=0.00000001;
		}
		ans=[0,0];
		ans[0]=(C1[1]-C2[1])/g;
		ans[1]=(C1[0]*ans[0])+C1[1];
		return ans;
		
		
	}
	this.angleCheck = function(p1,p2,ans){
		v = [(p2[0]-p1[0]),(p2[1]-p1[1])];
		pv = [(ans[0]-p1[0]),(ans[1]-p1[1])];
		if(myvec.newangle(v,pv) <=0.01){
			return true;
		}
		return false;
	}
	this.calparam = function(p1,p2){
		ans = [0,0];
		dinum = p2[0] - p1[0];
		//prevent the zero error
		if(dinum == 0){
			dinum = 0.00000001;
		}
		ans[0] = (p2[1]-p1[1])/dinum;
		ans[1] = p1[1] - (ans[0]*p1[0]);
		return ans;
	}
	
}
































