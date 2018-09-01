
//function to calculate vector properties of vectors
//function to calculate vector properties of vectors
function vec(){
	this.getangle=function(v){
		var x=v[0];
		var y=v[1];
		if(x==0){
			//addition
			if(y>=0){
				//return (0.5*Math.PI);
			}
			else{
				//return (1.5*Math.PI);
			}
			//end
			x=0.0001;
		}
		//addition
		if(y==0){
			if(x>=0){
				//return 0;
			}
			else{
				//return (Math.PI);
			}
		}
		//end
		var a = Math.atan(y/x);
		if(x>0){
			a+=Math.PI;
		}
		//adjust
		a-=Math.PI;
		if(a>=(2*Math.PI)){
			a-=(2*Math.PI);
		}
		if(a<0){
			a+=(2*Math.PI);
		}
		
		return a;
	}
	this.angle=function(p1,p2){
		var v = [p2[0]-p1[0],p2[1]-p1[1]];
		return this.getangle(v);
	}
	//angle between two vectors
	this.adiff=function(vec1,vec2){
		var a1=this.getangle(vec1);
		var a2=this.getangle(vec2);
		return Math.abs(a1-a2);
	}
	//function to multiple vector v ny scalar m
	this.mult=function(v,m){
		return this.getvec(m*this.mag(v),this.getangle(v));
	}
	
	this.length = function(vec1,vec2){
		var x=vec2[0]-vec1[0];
		var y=vec2[1]-vec1[1];
		var ans=Math.pow(x,2)+Math.pow(y,2);
		ans=Math.pow(ans,0.5);
		return ans;
	}
	this.mid = function(p1,p2){
		var x=(p1[0]+p2[0])/2;
		var y=(p1[1]+p2[1])/2;
		return [x,y];
	}
	//find the magnitude of  vector
	this.mag=function(v){
		var sum=0;
		for(var i=0;i<v.length;i++){
			sum+=Math.pow(v[i],2);
		}
		var ans= Math.pow(sum,0.5);
		return ans;
	}
	//find the distance between two vectors of similar n
	this.distance=function(vec1,vec2){
		var newv=[];
		for(var i=0;i<vec1.length;i++){
			newv.push(vec2[i]-vec1[i]);
		}
		return this.mag(newv);
	}
	this.dot=function(vec1,vec2){
		var ans=0;
		for(var i=0;i<vec1.length;i++){
			ans+=vec1[i]*vec2[i];
		}
		return ans;
	}
	this.minus=function(vec1,vec2){
		var newv=this.norm(vec2,vec1);
		var ans=[];
		for(var i=0;i<vec1.length;i++){
			ans.push(vec1[i]-newv[i]);
		}
		return ans;
	}
	this.add=function(vec1,vec2){
		var ans=[];
		for(var i=0;i<vec1.length;i++){
			ans.push(vec1[i]+vec2[i]);
		}
		return ans;
	}
	this.subtract = function(vec1,vec2){
		var ans=[];
		for(var i=0;i<vec1.length;i++){
			ans.push(vec1[i]-vec2[i]);
		}
		return ans;
	}
	this.newangle=function(l1,l2){
		var magn=(this.mag(l1)*this.mag(l2));
		var an = this.dot(l1,l2)/magn;
		return Math.acos(an);
	}
	this.angleBetween=function(vec1,vec2){
		a1 = this.getangle(vec1);
		a2 = this.getangle(vec2);
		return this.newangle(vec1,vec2);
		//return Math.abs(a1-a2);
	}
	this.norm=function(vec,line){
		if(this.mag(vec)==0 || this.mag(line)==0){
			return vec;
		}
		var diffa=this.newangle(vec,line);
		var newl=(this.mag(vec)*Math.cos(diffa));
		return this.getvec(newl,this.getangle(line));
	}
	//derive the angle right angled to the lay out
	this.opp=function(vec,line){
		var newl=this.rot(line,0.5*Math.PI);
		return this.norm(vec,newl);
	}
	this.rot=function(v,angle){
		var X=v[0]*Math.cos(angle) -v[1]*Math.sin(angle);
		
		var Y=v[1]*Math.cos(angle) +v[0]*Math.sin(angle);
		return [X,Y];
	}
	//function to rotate a vector and align it to another vector
	this.alignto=function(vec1,vec2,plus=0){
		var a= this.getangle(vec2);
		return this.rot(vec1,-a);
	}
	this.getvec=function(leng,angle){
		return this.rot([leng,0],angle);
	}
	//check if two vectors are facing each other
	this.isFacing = function(v1,v2){
		if(Math.abs(this.newangle(v1,v2))<(Math.PI/2)){
			return true;
		}
		return false;
	}
	//remove singularity
	this.correct = function(v){
		if(v[0]==0){
			v[0] = 0.0001;
		}
		return v;
	}
}

































