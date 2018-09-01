function manageGUI(){
	this.clickers = [];
	this.drawers = [];
	this.positions = [];
	this.pointer = null;
	this.width =0;
	this.height = 0;
	this.clicking = false;
	this.mousep =[0,0];
	this.jcl = true;
	//functions
	this.init = function(w,h){
		this.width = w;
		this.height = h;
	}
	//interaction functions
	this.mouseup = function(p){
		this.clicking = false;
	}
	this.mousemove = function(p){
		this.mousep =p;
		if(this.clicking){
			for(var i=this.clickers.length-1;i>=0;i--){
				if(this.clickers[i].collide(this.mousep[0],this.mousep[1])){
					this.dragtag(this.clickers[i]);
				
				}
			}
		}
	}
	this.mousedown = function(p){
		var ans = false;
		for(var i=0;i<this.clickers.length;i++){
			this.clickers[i].clicked = false;
		}
		for(var i=this.clickers.length-1;i>=0;i--){
			if(this.clickers[i].collide(this.mousep[0],this.mousep[1])){
				this.clickers[i].highlighted = true;
				this.jcl= true;
				if(this.clickers[i].rpos.isvisible() && this.clickers[i].isgood()){
					mech.clickpointer = null;
					mech.clickinfo = null;
					this.clickers[i].clicked = true;
					this.clickers[i].time =0;
					this.checktag(this.clickers[i]);
					ans = true;
					mech.manageclick();
					
				}
				if(this.jcl){
					mech.clear();
				}
				break;
			}
		}
		this.clicking = true;
		return ans;
	}
	//resizing functions
	this.prepare = function(w=this.width,h=this.height){
		for(var i=0;i<this.positions.length;i++){
			this.positions[i].prepare(w,h);
		}
	}
	this.resize = function(w,h){
		for(var i=0;i<this.positions.length;i++){
			this.positions[i].resize(w,h);
		}
	}
	//creation function
	this.toggle = function(x,y,w,h,col=null){
		var pos = new Pos(x,y,w,h);
		if(col==null){
			col = new collider(pos);
		}
		var dr = new imageBox(pos,"down",col);
		col.timing = true;
		col.maxtime = 3;
		this.positions.push(pos);
		this.clickers.push(col);
		this.drawers.push(dr);
		//tag things
		this.addtag("toggle");
		this.addtagger([dr,false]);
	}
	this.getdropdown = function(x,y,w,h,name="",elems=[],t=""){
		var sw = w/4;
		var mpos = new Pos(x,y,w,h);
		var mcol = new collider(mpos);
		this.getbutton(x,y,w,h,"",0);
		//add points
		//this.getbutton(x,y,w-sw,h,name,0);
		//this.lastclicker().isnumb = true;
		//this.lastdrawer(1).hasedge = false;
		var tpos = new Pos(x,y,w-sw,h);
		this.positions.push(tpos);
		this.addtext(tpos,name,this.lastclicker());
		//var ipos = new Pos(x+w-sw,y,sw,h);
		var nw = sw/2;
		var ny = y+(h-nw)/2;
		var nx = x+w-sw;
		var visp = new Pos(x,y,w,h);
		visp.visible = false;
		this.toggle(nx+nw/2,ny,nw,nw,this.lastclicker());
		var dr2 = this.lastdrawer();
		this.addtag("dropdown");
		this.addtagger([visp]);
		this.listout(x,y+h,w,h,elems,visp,dr2);
		
	}
	this.listout = function(x,y,w,h,elems=[],head=null,Dr=null){
		var dm = 0;
		this.getbutton(x-dm,y-dm,w+dm,h*elems.length+dm,"",0);
		this.lastpos().Parent = head;
		
		for(var i=0;i<elems.length;i++){
			this.getbutton(x,y,w,h,elems[i],0);
			this.lastpos().Parent = head;
			if(head!=null){
				this.addtag("dropchild");
				this.addtagger([head,Dr]);
			}
			this.lastdrawer(1).hasedge = false;
			y+=h;
		}
		
	}
	this.getbutton = function(x,y,w,h,name="",type=1){
		var pos = new Pos(x,y,w,h);
		//pos.visible = false;
		var col = new collider(pos);
		col.timing = true;
		var dr = new drawer(type,pos,col);
		var te = new textBox(pos,name,col);
		//col.timing = true;
		//add to list
		this.positions.push(pos);
		this.clickers.push(col);
		this.drawers.push(dr);
		this.drawers.push(te);
		this.addtag(name);
	}
	this.addtext = function(pos,name,col=null){
		var te = new textBox(pos,name,col);
		this.drawers.push(te);
	}
	this.gettextbox = function(x,y,w,h,name){
		var pos = new Pos(x,y,w,h);
		var te = new textBox(pos,name);
		
		//add to list
		this.positions.push(pos);
		this.drawers.push(te);
	}
	this.imgbutton = function(x,y,w,h,src){
		var pos = new Pos(x,y,w,h);
		var col = new collider(pos);
		var dr = new imageBox(pos,src,col);
		//
		this.positions.push(pos);
		this.clickers.push(col);
		this.drawers.push(dr);
		
	}
	this.imgbuttons = function(x,y,w,h,srcs){
		var pos = new Pos(x,y,w,h);
		var col = new collider(pos);
		var dr = new imageBox(pos,srcs[0],col);
		//
		this.positions.push(pos);
		this.clickers.push(col);
		this.drawers.push(dr);
		//add tags
		this.addtag("imgs");
		this.addtagger([srcs,0,dr]);
	}
	this.radiobutton = function(x,y,r,vis = false){
		var dm = 3;
		var pos = new Pos(x,y,r,r);
		var pos2 = new Pos(x+dm,y+dm,r-(2*dm),r-(2*dm));
		var col = new collider(pos);
		var dr1 = new drawer(2,pos);
		var dr2 = new drawer(2,pos2);
		dr2.hasedge = false;
		dr2.color = "gray";
		//add to list
		this.positions.push(pos);
		this.positions.push(pos2);
		this.drawers.push(dr1);
		this.drawers.push(dr2);
		this.clickers.push(col);
		pos2.visible = vis;
		//add tags
		this.addtag("radio");
		this.addtagger([pos2]);
	}
	this.getslider = function(x,y,w,h){
		var pos = new Pos(x,y,w,h);
		var pos1 = new Pos(x,y,w/2,h);
		var p = pos.getmid();
		var nh = h*1.5;
		var ny = y+h/2- nh/2
		var cpos = new Pos(p[0]-nh/2,ny,nh,nh);
		var col = new collider(pos);
		var dr1 = new drawer(1,pos);
		var dr2 = new drawer(1,pos1);
		var drc = new drawer(2,cpos);
		col.waiting = false;
		dr1.div = 2;
		dr2.div = 2;
		dr2.color = "gray";
		//add to list
		this.positions.push(pos);
		this.positions.push(pos1);
		this.positions.push(cpos);
		this.clickers.push(col);
		this.drawers.push(dr1);
		this.drawers.push(dr2);
		this.drawers.push(drc);
		//tag things
		this.addtag("slider");
		this.addtagger([cpos,pos1,nh,w]);
	}
	//operation function
	this.addtag = function(t){
		//add a tag to the last clicker
		if(this.clickers.length>0){
			var c = this.clickers[this.clickers.length-1];
			c.tags.push(t);
		}
	}
	this.addtagger = function(li){
		if(this.clickers.length>0){
			var c = this.clickers[this.clickers.length-1];
			for(var i=0;i<li.length;i++){
				c.deps.push(li[i]);
			}
		}
	}
	this.lastclicker = function(i=0){
		if(this.clickers.length>i){
			return this.clickers[this.clickers.length-1-i];
		}
		return null;
	}
	this.lastdrawer = function(i=0){
		if(this.drawers.length>i){
			return this.drawers[this.drawers.length-1-i];
		}
		return null;
	}
	this.lastpos = function(i=0){
		if(this.positions.length>i){
			return this.positions[this.positions.length-1-i];
		}
		return null;
	}
	this.dragtag = function(c){
		for(var i = 0;i<c.tags.length;i++){
			var t = c.tags[i];
			if(t=="slider"){
				c.deps[0].pos[0]=this.mousep[0]-c.deps[2]/2;
				c.deps[1].width = this.mousep[0]-c.deps[1].getpos()[0];
				this.calscale(c.deps[1].width,c.deps[3]);
			}
		}
	}
	this.calscale = function(w1,w){
		mech.scale = w1/w +(0.5);
		//increment
		mech.scale = ((mech.scale-1)*1.5)+1.1;
	}
	this.checktag = function(c){
		for(var i = 0;i<c.tags.length;i++){
			var t = c.tags[i];
			//add some rules
			if(t=="slider"){
				c.deps[0].pos[0]=this.mousep[0]-c.deps[2]/2;
				c.deps[1].width = this.mousep[0]-c.deps[1].getpos()[0];
				this.calscale(c.deps[1].width,c.deps[3]);
			}
			if(t=="toggle"){
				/*
				var bo = c.deps[1];
				if(bo){
					c.deps[0].src ="down";
				}
				else{
					c.deps[0].src ="up";
				}
				*/
				if(c.deps[0].src =="down"){
					c.deps[0].src ="up";
					c.deps[1]=true;
				}
				else{
					c.deps[0].src = "down";
					c.deps[1]=false;
				}
				//c.deps[1]=!bo;
			}
			if(t == "imgs"){
				c.deps[1]++;
				if(c.deps[1]>=c.deps[0].length){
					c.deps[1]=0;
				}
				c.deps[2].src = c.deps[0][c.deps[1]];
			}
			if(t=="dropdown"){
				c.deps[2].visible = c.deps[1];
			}
			if(t=="dropchild"){
				c.deps[0].visible = false;
				c.deps[1].src = "down";
			}
			if(t=="radio"){
				c.deps[0].visible = !c.deps[0].visible;
			}
			
			if(t == "update"){
				this.jcl = false;
				mech.updatejoint();
			}
			if(t == "sim"){
				mech.updating = !mech.updating;
			}
			if(t=="JOINT"){
				mech.clickinfo = "joint";
			}
			if(t=="GEAR"){
				mech.clickinfo = "gear";
			}
			if(t=="LINK"){
				mech.getlink();
			}
			if(t=="PATH"){
				mech.clickinfo = "path";
				//mech.getpath();
			}
			if(t=="JOIN"){
				mech.join();
			}
			if(t == "DELETE"){
				mech.Delete();
			}
			if(t=="CLEAR"){
				mech.DeleteAll();
			}
			if(t == "4-bars"){
				loader.fourbars();
			}
			if(t == "6-bars"){
				loader.sixbars();
			}
			if(t == "mech1"){
				loader.mech1();
			}
			if(t == "mech2"){
				loader.mech2();
			}
		}
	}
	//looping functions
	this.update = function(){
		for(var i=0;i<this.clickers.length;i++){
			this.clickers[i].update();
			this.clickers[i].highlighted = false;
		}
		//check if mouse is over a button
		for(var i=this.clickers.length-1;i>=0;i--){
			if(this.clickers[i].collide(this.mousep[0],this.mousep[1])){
				this.clickers[i].highlighted = true;
				/*
				if(this.clicking && this.clickers[i].rpos.isvisible() && this.clickers[i].isgood()){
					this.clickers[i].clicked = true;
					this.checktag(this.clickers[i]);
				}
				*/
				break;
			}
		}
	}
	this.draw = function(){
		for(var i=0;i<this.drawers.length;i++){
			if(this.drawers[i].rpos.isvisible()){
				this.drawers[i].draw();
			}
		}
	}
}
