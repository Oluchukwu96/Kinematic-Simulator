
function graph(){
	this.points = [];
	this.lines =[];
	
	this.setup = function(info){
		for(var i=0;i<info.length;i++){
			var cu = info[i];
			if(cu[0]<this.points.length){
				this.points[cu[0]].avel = cu[1];
			}
		}
	}
	
	this.addNode = function(p){
		var po = new point(p[0],p[1]);
		this.points.push(po);
	}
	this.addEdge = function(a,b){
		if(this.points.length>a && this.points.length>b){
			this.points[a].connect(this.points[b]);
			//create line
			this.lines.push(new line(this.points[a],this.points[b]));
		}
	}
	//fix a node to its position
	this.fix = function(index,avel = null){
		if(this.points.length>index){
			this.points[index].isStatic = true;
			if(avel!=null){
				this.points[index].avel = avel;
			}
		}
	}
	//restrict the motion og specific nodes
	this.addconstraints = function(){
		for(var i=0;i<this.points.length;i++){
			var po = this.points[i];
			if(po.isStatic){
				po.rotated = true;
				for(var j=0;j<po.connections.length;j++){
					po.connections[j].addconstraint(po,po.lengths[j]);
				}
			}
		}
	}
	this.draw = function(){
		//draw all lines
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].draw();
		}
	}
	this.move = function(dx,dy){
		for(var i=0;i<this.points.length;i++){
			this.points[i].move(dx,dy);
		}
	}
	this.rotate = function(da,index=0){
		if(this.points.length>index){
			this.addconstraints();
			this.points[index].rotateAbout(this.points[index],da);
			this.points[index].clear();
		}
	}
	//change the direction of rotation
	this.reverse = function(){
		for(var i =0;i<this.points.length;i++){
			this.points[i].avel *=-1;
		}
	}
	this.update = function(){
		var store = this.getpos();
		//rotate all actuators
		for(var a =0;a<this.points.length;a++){
			var da = this.points[a].avel;
			if(da!=0){
				/*
				for(var i=0;i<this.points.length;i++){
					if(!this.points[i].isStatic){
						this.points[i].rotateabout(this.points[a],da);
					}
				}
				*/
				this.points[a].shortrotate(da);
				this.points[a].clear();//clear everything for now
				//neighbors values are constant
				for(var i=0;i<this.points[a].connections.length;i++){
					if(!this.points[a].connections[i].rotated){
						this.points[a].connections[i].rotated=true;
						this.points[a].connections[i].giveconstraint();
					}
				}
			}
		}
		//continue solving until all points are solved
		var count = 1;
		var guessed = false;
		while(count>0){
			count = this.cal1();
			if(count==0){
				count = this.guess();
			}
		}
		if(!this.isgood()){
			this.updateall(store);
			this.reverse();
		}
	}
	this.guess = function(){
		for(var i=0;i<this.points.length;i++){
			if(!this.points[i].rotated){
				if(this.points[i].guess()){
					return 1;
				}
			}
		}
		return 0;
	}
	this.newrotate = function(da,index =0){
		if(this.points.length>index){
			for(var i=0;i<this.points.length;i++){
				if(!this.points[i].isStatic){
					this.points[i].rotateabout(this.points[index],da);
				}
			}
			this.points[index].clear();//clear everything for now
			//neighbors values are constant
			for(var i=0;i<this.points[index].connections.length;i++){
				if(!this.points[index].connections[i].rotated){
					this.points[index].connections[i].rotated=true;
					this.points[index].connections[i].giveconstraint();
				}
			}
			//continue solving until all points are solved
			var count = 1;
			while(count>0){
				count = this.cal1(index);
			}
		}
		alert(this.getpos());
	}
	this.cal1 = function(index =-1){
		var count =0;
		for(var i=0;i<this.points.length;i++){
			if(!this.points[i].rotated){
				if(this.points[i].isStatic || this.points[i].avel!=0 || i == index){
					this.points[i].rotated = true;
					this.points[i].giveconstraint();
					count+=1;
				}
				else if(this.shouldeval(i)){
					this.points[i].evalpos();//check if good
					this.points[i].rotated = true;
					this.points[i].giveconstraint();
					count+=1;
				}
			}
		}
		return count;
	}
	this.shouldeval = function(i){
		if(this.points[i].constraints.length>1){
			return true;
		}
		if(this.points[i].constraints.length==1){
			if(this.points[i].path!=null){
				return true;
			}
		}
		return false;
	}
	//get the positions of all points
	this.getpos = function(){
		var ans =[];
		for(var i =0;i<this.points.length;i++){
			ans.push(this.points[i].getpoint());
		}
		return ans;
	}
	//update all points with new positions
	this.updateall = function(pos){
		if(pos.length == this.points.length){
			for(var i =0;i<this.points.length;i++){
				this.points[i].update(pos[i]);
			}
		}
	}
	//check if a position is good in javascript
	this.isgood = function(){
		for(var i =0;i<this.points.length;i++){
			var p = this.points[i].getpoint();
			if(isNaN(p[0]) || isNaN(p[1])){
				return false;
			}
			//check if in path
			if(this.points[i].path!=null){
				if(!this.points[i].path.isInside(p)){
					return false;
				}
			}
		}
		//check lines
		for(var i=0;i<this.lines.length;i++){
			if(!this.lines[i].check()){
				//return false;
			}
		}
		return true;
	}
}




//The class storing linkage variables
function mech(){
	this.root =null; // the first point the the class
	this.end = null;
	this.lines = []; // to be used for storing the line to be drawn
	this.origin = new point(0,0);
	this.points = [];
	this.endpos = [0,0];
	var myvec = new vec();
	
	this.add = function(po){
		this.points.push(po);
		if(this.root == null){
			this.root = po;
			this.end = po;
			this.endpos = this.end.getpoint();
		}
		else{
			this.lines.push(new line(this.end,po));
			this.end.isStatic = false;
			this.end.connect(po);
			this.end = po;
			this.end.isStatic = true;
			this.endpos = this.end.getpoint(); 
		}
	}
	//add vector to the end of the line
	this.moveto = function(x,y){
		if(this.root == null){
			this.root = new point(0,0);
			//this.root.origin = this.origin;
			this.end = this.root;
			this.points.push(this.root);
		}
		var co = this.end.copy();
		//co.origin = this.origin;
		co.move(x,y);
		this.add(co);
	}
	this.draw = function(){
		//draw all lines
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].draw();
		}
	}
	this.update = function(){
		this.draw();
	}
	//minor methods
	this.move = function(dx,dy){
		this.origin.move(dx,dy);
		for(var i=0;i<this.points.length;i++){
			this.points[i].move(dx,dy);
		}
		this.endpos = myvec.add(this.endpos,[dx,dy]);
	}
	this.rotate = function(da){
		this.root.newrotate(da);
		//add constrants
		//this.end.moveallto(this.endpos);
		this.end.followall(this.endpos);
		this.end.clear();
		//this.root.moveallto(this.origin.getpoint());
		//this.root.clear();
	}
	this.face = function(p){
		this.end.followall(p);
		this.end.clear();
		this.root.moveallto(this.origin.getpoint());
		this.root.clear();
	}
	// the correct rotation function
	this.newrotate = function(da){
		//add constraints
		this.root.rotated = true;
		this.end.rotated = true;
		this.root.shortrotate(da);
		var count = this.constrain();
		//count = this.constrain();
		this.root.clear();
	}
	//just rotate this thing man
	this.testrotate = function(da){
		//add constraints
		this.root.rotated = true;
		this.end.rotated = true;
		this.root.shortrotate(da);
		var c1 = new circle(this.points[1].getpoint(),70);
		var c2 = new circle(this.points[3].getpoint(),70);
		var sols = c1.colpoints(c2);
		var ans = this.getclose(this.points[2].getpoint(),sols);
		//alert(this.points[1].getpoint());
		this.points[2].update(ans);
		this.root.clear();
	}
	//adjust
	this.constrain = function(){
		var count = 0;
		for(var i=0;i<this.points.length;i++){
			//add constraint to other points
			if(this.points[i].rotated){
				for(var j=0;j<this.points[i].connections.length;j++){
					var cp = this.points[i].connections[j];
					if(!cp.rotated){
						cp.addconstraint(cp,this.points[i].lengths[j]);
						//alert("cv " +cp.constraints[0] );
					}
				}
			}
			else{
				//alert("here");
				//alert("length "+ this.points[i].constraints.length);
				count+=1;
				//calculate constraint if posible
				if(this.points[i].constraints.length>=2){
					var newp = this.calpos(this.points[i]);
					//alert("point "+newp);
					if(newp!=null){
						//this.points[i].update(newp);
						this.points[2].update([350,310]);
						this.points[i].rotated =true;
					}
					this.points[i].constraints =[];
				}
			}
		}
		return count;
	}
	//calculate the position
	this.calpos = function(p){
		//alert("c1 "+p.constraint[0]);
		//var c1 = p.constraints[0];
		//var c2 = p.constraints[1];
		//var c1 = new circle(this.points[1].getpoint(),myvec.length(this.points[1].getpoint(),this.points[2].getpoint()));
		//var c2 = new circle(this.points[3].getpoint(),myvec.length(this.points[3].getpoint(),this.points[2].getpoint()));
		var c1 = new circle(this.points[1].getpoint(),50);
		var c2 = new circle(this.points[3].getpoint(),70);
		//alert(this.points[3].getpoint());
		var sols = c1.colpoints(c2);
		//alert("point "+p.constraints[1].pos);
		if(sols.length==0){
			return null;
		}
		if(Math.abs(c1.r - myvec.mag(myvec.subtract(sols[0],c1.pos)))>0.01){
			return null;
		}
		var ret = this.getclose(p.getpoint(),sols);
		//alert("The things "+ ret);
		return ret;
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
	
}


