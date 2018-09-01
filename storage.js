
function storage(){
	this.fourbars = function(){
		var x = canvas.width/2;
		var y = canvas.height/2;
		var s = 3;
		mech.DeleteAll();
		mech.getjoint([-30*s+x,30*s+y]);
		mech.getjoint([-10*s+x,-10*s+y]);
		mech.getjoint([75*s+x,-90*s+y]);
		mech.getjoint([110*s+x,0*s+y]);
		mech.makelink(0,1);
		mech.makelink(2,1);
		mech.makelink(3,2);
		mech.fix(3);
		
	}
	this.sixbars = function(){
		var x = canvas.width/2-100;
		var y = canvas.height/2+100;
		var s = 15;
		mech.DeleteAll();
		mech.getjoint([0*s+x,0*s+y]);
		mech.getjoint([5*s+x,-5*s+y]);
		mech.getjoint([10*s+x,-18*s+y]);
		mech.getjoint([18*s+x,-14*s+y]);
		mech.getjoint([20*s+x,0*s+y]);
		mech.getjoint([24*s+x,-24*s+y]);
		mech.getjoint([24*s+x,-12*s+y]);
		mech.makelink(0,1);
		mech.makelinks([2,3,1]);
		mech.makelink(3,4);
		mech.makelink(2,5);
		mech.makelink(5,6);
		mech.fix(4);
		mech.fix(6);
	}
	this.mech1 = function(){
		var x = canvas.width/2;
		var y = canvas.height/2;
		var s = 1;
		mech.DeleteAll();
		mech.getgear([-30*s+x,0*s+y]);
		mech.getgear([0*s+x,0*s+y],24);
		mech.gearjoin(0,1);
		mech.getjoint([240*s+x,-25*s+y]);
		mech.jointdrag(mech.joints[2]);
		mech.getjoint([280*s+x,-180*s+y]);
		mech.getjoint([480*s+x,0*s+y]);
		mech.makelink(2,3);
		mech.makelink(3,4);
		mech.fix(4);
		
	}
	this.mech2 = function(){
		var x = canvas.width/2;
		var y = canvas.height/2;
		var s = 1;
		mech.DeleteAll();
		mech.getgear([-30*s+x,0*s+y],50);
		mech.getjoint([100*s+x,-100*s+y]);
		mech.jointdrag(mech.joints[1]);
		mech.getjoint([380*s+x,-200*s+y]);
		mech.getjoint([80*s+x,-300*s+y]);
		mech.getjoint([500*s+x,-350*s+y]);
		mech.makepath(3,4);
		mech.makejoin(2,0);
		mech.makelink(1,2);
		mech.getjoint([500*s+x,-500*s+y]);
		mech.getjoint([350*s+x,-550*s+y]);
		mech.makelink(5,2);
		mech.makelink(5,6);
		mech.fix(6);
		
	}
}
