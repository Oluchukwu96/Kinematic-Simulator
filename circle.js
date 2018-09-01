//class for storing circles
function circle(pos,radius){
	this.pos = pos;
	this.r = radius;
	
	//functions
	//get the point of intersection of two circles
	this.colpoints = function(c){
		var length = myvec.length(this.pos,c.pos);
		var trigs = this.getvals(this.r,c.r,length);
		//vector
		var v = myvec.subtract(c.pos,this.pos);
		var p3 = myvec.add(this.pos,myvec.getvec(trigs[0],myvec.getangle(v)));
		//var p3 = myvec.mult(myvec.add(p1,p2),0.5);
		//project
		var an = myvec.getangle(myvec.subtract(c.pos,this.pos));
		var a1 = myvec.add(myvec.getvec(trigs[1],(an+Math.PI/2)),p3);
		var a2 = myvec.add(myvec.getvec(trigs[1],(an-Math.PI/2)),p3);
		//return the relevant information
		return [a1,a2];
	}
	//get the point of intersection of a line and a circle
	this.linepoints = function(l){
		var po = new point(this.pos[0],this.pos[1]);
		var np = l.shortestpoint(po);
		var length = myvec.length(this.pos,np);
		var an = myvec.getangle(myvec.subtract(np,this.pos));
		var opp = Math.pow(this.r,2) - Math.pow(length,2);
		opp = Math.pow(opp,0.5);
		if(length<=this.r){
			var a1 = myvec.add(myvec.getvec(opp,(an+Math.PI/2)),np);
			var a2 = myvec.add(myvec.getvec(opp,(an-Math.PI/2)),np);
			//return the relevant information
			return [a1,a2];
		}
		return [[NaN,NaN]];
	}
	//get the trig values for solving
	this.getvals = function(r1,r2,d){
		var a = (Math.pow(r1,2)-Math.pow(r2,2)+Math.pow(d,2))/(2*d);
		var h = Math.pow((Math.pow(r1,2)-Math.pow(a,2)),0.5);
		return [a,h];
	}
	//collide with lines
	
}