function mechanism(){
	this.links = [];
	this.joints = [];
	this.lines = [];
	this.gears = [];
	this.group = [];
	this.mousep =[0,0];
	this.jpointer = null;
	this.lpointer = null;
	this.gpointer = null;
	this.updating = false;
	this.adjusting = false;
	this.mousetype = "default";
	this.maxtime = 8;
	this.time = 0;
	var myvec = new vec();
	this.start = null;
	this.end = null;
	
	//scaling
	this.scale = 1;
	
	//booleans
	this.ismousedown = false;
	this.isdragging = false;
	this.ldragging = false;
	
	//clicker variables
	this.fixed = null;
	this.rotating = null;
	this.grid = null;
	
	//clicking variables
	this.clickpointer = null;
	this.clickinfo = null;
	
	//functions
	this.mouseup = function(p){
		p = this.toworld(p);
		this.ismousedown = false;
		this.isdragging = false;
		this.adjusting = false;
		this.ldragging = false;
	}
	this.mousemove = function(p){
		p = this.toworld(p);
		if(this.adjusting && this.gpointer!=null){
			this.gpointer.removeall();
			this.gpointer.adjust(this.mousep,p);
			this.gearconnect(this.gpointer);
		}
		if(this.isdragging && this.jpointer!=null){
			var diff = myvec.subtract(p,this.mousep);
			this.jpointer.move(diff[0],diff[1]);
			if(this.jpointer.pathparent!=null){
				this.jpointer.pathparent.align(this.jpointer);
			}
			if(this.jpointer.gear!=null){
				this.jpointer.gear.removeall();
				this.gearconnect(this.jpointer.gear);
			}
			else{
				this.jointconnect(this.jpointer);
			}
		}
		if(this.ldragging && this.lpointer!=null){
			var diff = myvec.subtract(p,this.mousep);
			this.lpointer.move(diff[0],diff[1],this);
			//this.linkstep(p);
		}
		if(this.clickpointer!=null){
			this.clickpointer.update(p);
		}
		this.mousep = p;
	}
	this.mousedown = function(p){
		p = this.toworld(p);
		this.ismousedown = true;
		if(this.mousetype == "e-resize"){
			this.adjusting = true;
		}
		else if(!this.click(p)){
			this.doclick(p);
			/*
			if(this.time<this.maxtime){
				this.getjoint(p);
			}
			*/
			this.clear();
		}
		this.time = 0;
	}
	//stepping functions
	this.linkstep = function(p){
		var diff = myvec.subtract(p,this.mousep);
		var tempj = new point(this.mousep[0],this.mousep[1]);
		this.lpointer.connect(tempj);
		tempj.move(diff[0],diff[1]);
		tempj.clear();
		tempj.rotated = true;
		tempj.isStatic = true;
		for(var i=0;i<tempj.connections.length;i++){
			//tempj.connections[i].rotated = true;
			tempj.connections[i].giveconstraint();
		}
		this.STEP();
		this.lpointer.removeboth(tempj);
	}
	//end
	this.gearconnect = function(g){
		for(var i =0;i<this.gears.length;i++){
			if(this.gears[i]!=g){
				g.checkconnect(this.gears[i]);
			}
		}
		//console.log(g.connections.length);
	}
	this.doclick = function(p){
		if(this.clickinfo == "joint"){
			this.getjoint(p);
		}
		else if(this.clickinfo == "gear"){
			this.getgear(p);
		}
		else if(this.clickinfo == "path"){
			var p1 = new point(this.mousep[0],this.mousep[1]);
			var p2 = new point(this.mousep[0],this.mousep[1]);
			this.joints.push(p1);
			this.joints.push(p2);
			this.links.push(new path(p1,p2));
			this.clickinfo = "pathing";
			this.clickpointer = p2;
		}
		else if(this.clickinfo == "pathing"){
			this.clickpointer=null;
			this.clickinfo = null;
		}
		
	}
	this.manageclick = function(){
		if(this.clickinfo == "joint"){
			this.clickpointer = new point(this.mousep[0],this.mousep[1]);
			console.log("Jesus is Lord");
		}
		else if(this.clickinfo == "gear"){
			var g = new gear(new point(this.mousep[0],this.mousep[1]),16);
			this.clickpointer = g;
		}
		else if(this.clickinfo == "path"){
			var po = new point(this.mousep[0],this.mousep[1]);
			po.color = "white";
			this.clickpointer = po;
		}
		else{
			this.clickpointer=null;
			this.clickinfo = null;
		}
	}
	this.jointdrag = function(j){
		if(j.pathparent!=null){
			j.pathparent.align(j);
		}
		if(j.gear!=null){
			this.j.gear.removeall();
			this.gearconnect(j.gear);
		}
		else{
			this.jointconnect(j);
		}
	}
	this.jointconnect = function(j){
		if(j.shape!=null){
			if(!j.shape.collide(j.getpoint())){
				if(j.shape.type == "gear"){
					j.shape.pos.removeboth(j);
					j.shape = null;
				}
				else if(j.shape.type == "link"){
					j.shape.removeboth(j);
					j.shape = null;
				}
				
			}
		}
		//check if colliding with a gear
		if(j.shape == null){
			for(var i=0;i<this.gears.length;i++){
				if(this.gears[i].collide(j.getpoint())){
					this.gears[i].pos.connect(j);
					j.shape = this.gears[i];
					break;
				}
			}
		}
		//check if colliding with a link
		if(j.shape == null && j.path == null){
			for(var i=0;i<this.links.length;i++){
				if(this.links[i].type == "link" && !this.links[i].contains(j) 
					&& this.links[i].collide(j.getpoint())){
					this.links[i].connect(j);
					j.shape = this.links[i];
					break;
				}
			}
		}
		//adjust length connections
		var store = j.connections;
		//console.log(store);
		j.removeall();
		j.connectall(store);
	}
	this.click = function(p){
		for(var i=this.joints.length-1;i>=0;i--){
			if(this.joints[i].collide(p)){
				this.isdragging = true;
				this.jpointer = this.joints[i];
				this.jpointer.selected = true;
				this.showjoint();
				if(!this.ingroup(this.joints[i])){
					this.group.push(this.joints[i]);
				}
				this.clickpointer = null;
				this.clickinfo = null;
				return true;
			}
		}
		for(var j =this.links.length-1; j>=0;j--){
			if(this.links[j].collide(p)){
				this.links[j].selected = true;
				this.lpointer = this.links[j];
				this.ldragging = true;
				this.clickpointer = null;
				this.clickinfo = null;
				return true;
			}
		}
		return false;
	}
	this.Delete = function(){
		if(this.jpointer!=null && this.jpointer.selected){
			this.jpointer.removeall();
			if(this.jpointer.gear!=null){
				this.jpointer.gear.removeall();
				this.gears = this.remove(this.gears,this.jpointer.gear);
			}
			//remove from link
			for(var i=this.links.length-1;i>=0;i--){
				this.links[i].joints = this.remove(this.links[i].joints,this.jpointer);
				if(this.links[i].joints.length<2){
					this.links = this.remove(this.links,this.links[i]);
				}
			}
			this.joints = this.remove(this.joints,this.jpointer);
		}
		if(this.lpointer!=null && this.lpointer.selected){
			this.lpointer.Delete();
			if(this.lpointer.type == "path"){
				for(var i = 0;i<this.joints.length;i++){
					if(this.lpointer === this.joints[i].pathparent){
						this.joints[i].pathparent = null;
						this.joints[i].path = null;
					}
				}
				this.joints = this.remove(this.joints,this.lpointer.p1);
				this.joints = this.remove(this.joints,this.lpointer.p2);
				
			}
			this.links = this.remove(this.links,this.lpointer);
		}
	}
	this.DeleteAll = function(){
		this.joints = [];
		this.links = [];
		this.gears = [];
		this.jpointer = null;
		this.lpointer = null;
		this.start = null;
	}
	//remove element from array if it exists
	this.remove = function(arr,ele){
		var store = [];
		for(var i=0;i<arr.length;i++){
			if(arr[i] === ele){
				var no = 0;
			}
			else{
				store.push(arr[i]);
			}
		}
		arr = store;
		return arr;
	}
	this.showjoint = function(){
		var j = this.jpointer;
		this.fixed.deps[0].visible = j.isStatic;
		if(j.avel == 0){
			this.rotating.deps[0].visible = false;
		}
		else{
			this.rotating.deps[0].visible = true;
		}
	}
	this.updatejoint = function(){
		var j = this.jpointer;
		if(j!=null && j.selected){
			j.isStatic = this.fixed.deps[0].visible;
			if(this.rotating.deps[0].visible == false){
				j.avel = 0;
			}
			else{
				j.avel = 0.1;
			}
		}
		
	}
	this.ingroup = function(j){
		if(!j.visible){
			return true;
		}
		for(var i=0;i<this.group.length;i++){
			if(this.group[i]===j){
				return true;
			}
		}
		return false;
	}
	this.clear = function(){
		for(var i =0;i<this.gears.length;i++){
			this.gears[i].pos.selected = false;
		}
		//clear highlight
		for(var i =0;i<this.group.length;i++){
			this.group[i].selected = false;
		}
		for(var i =0;i<this.links.length;i++){
			this.links[i].selected = false;
		}
		this.group = [];
	}
	this.getjoint = function(p){
		var p = new point(p[0],p[1]);
		this.joints.push(p);
		if(this.start == null){
			this.start = p;
			p.isStatic = true;
			p.avel = 0.1;
		}
		/*
		else if(this.end == null){
			this.end = p;
		}
		else{
			this.end.isStatic = false;
			this.end = p;
			p.isStatic = true;
		}
		*/
	}
	this.getlink = function(){
		if(this.group.length>1 && this.group.length<4){
			this.links.push(new linkage(this.group));
		}
	}
	
	this.getgear = function(p,tno = 30){
		this.getjoint(p);
		this.gears.push(new gear(this.joints[this.joints.length-1],tno));
	}
	this.getpath = function(){
		if(this.group.length == 2){
			this.links.push(new path(this.group[0],this.group[1]));
		}
	}
	this.join = function(){
		if(this.lpointer!=null && this.jpointer!=null){
			if(this.lpointer.selected && this.jpointer.selected){
				if(this.lpointer.type == "path" && this.jpointer.path==null){
					this.lpointer.join(this.jpointer);
				}
			}
		}
	}
	this.update = function(){
		if(this.time<this.maxtime){
			this.time++;
		}
		if(this.updating){
			this.UPDATE();
		}
		//adjusting gears
		this.mousetype = "default";
		for(var i=0;i<this.gears.length;i++){
			if(this.gears[i].edgecollide(this.mousep)){
				this.mousetype = "e-resize";
				this.gpointer = this.gears[i]
			}
			
		}
		canvas.style.cursor = this.mousetype;
	}
	this.draw = function(){
		if(this.grid.deps[0].visible){
			this.drawGrid();
		}
		
		for(var k =0;k<this.gears.length;k++){
			this.gears[k].draw();
		}
		for(var j=0;j<this.links.length;j++){
			this.links[j].draw();
		}
		for(var i=0;i<this.joints.length;i++){
			this.joints[i].draw();
		}
		if(this.clickpointer!=null){
			this.clickpointer.draw();
		}
	}
	this.toscreen = function(p){
		p[0] = ((p[0] - canvas.width/2)*this.scale) + canvas.width/2;
		p[1] = ((p[1] - canvas.height/2)*this.scale)+ canvas.height/2;
		return p;
		
	}
	this.toworld = function(p){
		p[0] = ((p[0] - canvas.width/2 )/this.scale) + canvas.width/2;
		p[1] = ((p[1] - canvas.height/2)/this.scale) + canvas.height/2;
		return p;
	}
	//drawing grid 
	this.drawGrid = function(){
		//draw vertical lines
		var gridsize = 50 * this.scale;
		var x1 = canvas.width/2;
		var x2 = canvas.width/2;
		while(x1<width){
			this.drawLine([x1,0],[x1,canvas.height]);
			this.drawLine([x2,0],[x2,canvas.height]);
			x1+=gridsize;
			x2-=gridsize;
		}
		//draw horizontal lines
		var y1 = canvas.height/2;
		var y2 = canvas.height/2;
		while(y1<canvas.height){
			this.drawLine([0,y1],[canvas.width,y1]);
			this.drawLine([0,y2],[canvas.width,y2]);
			y1+=gridsize;
			y2-=gridsize;
		}
	}
	this.drawLine = function(p1,p2){
		can.strokeStyle="#6f7072";
		can.beginPath();
		can.lineWidth=2;
		can.moveTo(p1[0],p1[1]);
		can.lineTo(p2[0],p2[1]);
		can.stroke();
		can.closePath();
	}
	//rotational variables
	this.getpos = function(){
		var ans =[];
		for(var i =0;i<this.joints.length;i++){
			ans.push(this.joints[i].getpoint());
		}
		return ans;
	}
	this.guess = function(){
		for(var i=0;i<this.joints.length;i++){
			if(!this.joints[i].rotated){
				if(this.joints[i].pathparent!=null){
					this.joints[i].pathparent.align(this.joints[i]);
					//ending remarks
					this.joints[i].rotated = true;
					this.joints[i].giveconstraint();
					return 1;
				}
			}
		}
		for(var i=0;i<this.joints.length;i++){
			if(!this.joints[i].rotated){
				if(this.joints[i].guess()){
					return 1;
				}
			}
		}
		return 0;
	}
	this.shouldeval = function(i){
		if(this.joints[i].constraints.length>1){
			return true;
		}
		if(this.joints[i].constraints.length==1){
			if(this.joints[i].path!=null){
				var per = this.joints[i].pathparent;
				if(per.ischild() && !per.allrotated()){
					return false;
				}
				return true;
			}
		}
		return false;
	}
	this.cal1 = function(index =-1){
		var count =0;
		for(var i=0;i<this.joints.length;i++){
			if(!this.joints[i].rotated){
				if(this.joints[i].isStatic || this.joints[i].avel!=0 || i == index || !this.joints[i].visible){
					this.joints[i].rotated = true;
					this.joints[i].giveconstraint();
					count+=1;
				}
				else if(this.shouldeval(i)){
					this.joints[i].evalpos();//check if good
					this.joints[i].rotated = true;
					this.joints[i].giveconstraint();
					count+=1;
				}
			}
		}
		return count;
	}
	this.testeval = function(i){
		var j = this.joints[i];
		if(this.joints[i].pathchild!=null){
			if(j.pathself.ischild() && j.pathchild.rotated){
				
			}
		}
		
	}
	this.reverse = function(){
		for(var i =0;i<this.joints.length;i++){
			this.joints[i].avel *=-1;
		}
	}
	this.updateall = function(pos){
		if(pos.length == this.joints.length){
			for(var i =0;i<this.joints.length;i++){
				this.joints[i].update(pos[i]);
			}
		}
	}
	//external controls
	this.makelink = function(a,b){
		if(a<this.joints.length && b<this.joints.length ){
			this.links.push(new linkage([this.joints[a],this.joints[b]]));
		}
	}
	this.makelinks = function(g){
		var ng = [];
		for(var i =0;i<g.length;i++){
			ng.push(this.joints[g[i]]);
		}
		this.links.push(new linkage(ng));
	}
	this.fix = function(i,sp =0){
		if(i<this.joints.length){
			this.joints[i].isStatic = true;
			this.joints[i].avel = sp;
		}
	}
	this.makepath = function(a,b){
		if(a<this.joints.length && b<this.joints.length ){
			this.links.push(new path(this.joints[a],this.joints[b]));
		}
	}
	this.makejoin = function(ji,pi){
		if(ji<this.joints.length && pi<this.links.length ){
			if(this.links[pi].type == "path"){
				this.links[pi].join(this.joints[ji]);
			}
		}
	}
	this.gearjoin = function(a,b){
		this.gears[a].checkconnect(this.gears[b]);
	}
	this.isgood = function(){
		for(var i =0;i<this.joints.length;i++){
			var p = this.joints[i].getpoint();
			if(isNaN(p[0]) || isNaN(p[1])){
				return false;
			}
			//check if in path
			if(this.joints[i].path!=null){
				if(!this.joints[i].path.isInside(p)){
					return false;
				}
			}
		}
		//make sure the length of the links stay the same
		for(var i=0;i<this.links.length;i++){
			if(!this.links[i].check()){
				return false;
			}
		}
		return true;
	}
	//move assembly
	this.STEP = function(){
		var store = this.getpos();
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
	this.UPDATE = function(){
		var store = this.getpos();
		//rotate all actuators
		for(var a =0;a<this.joints.length;a++){
			var da = this.joints[a].avel;
			if(da!=0){
				this.joints[a].angle+=da;
				this.joints[a].shortrotate(da);
				this.joints[a].clear();//clear everything for now
				//rotate gear
				if(this.joints[a].gear!=null){
					this.joints[a].gear.rotate(da);
				}
				//neighbors values are constant
				for(var i=0;i<this.joints[a].connections.length;i++){
					if(!this.joints[a].connections[i].rotated){
						this.joints[a].connections[i].rotated=true;
						this.joints[a].connections[i].giveconstraint();
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
}

