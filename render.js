function rgb(r,g,b){return gfx.fillStyle=gfx.strokeStyle="rgb("+Math.floor(255*r)+","+Math.floor(255*g)+","+Math.floor(255*b)+")";};
function rgba(r,g,b,a){return gfx.fillStyle=gfx.strokeStyle="rgba("+Math.floor(255*r)+","+Math.floor(255*g)+","+Math.floor(255*b)+","+a+")";};

function hsv(h,s,v){
	var r,g,b,i,f,p,q,t;
	if (h&&s===undefined&&v===undefined)s=h.s,v=h.v,h=h.h;
	i = Math.floor(h*6);
	f = h*6-i;
	p = v*(1-s);
	q = v*(1-f*s);
	t = v*(1-(1-f)*s);
	switch(i%6){
		case 0:r=v,g=t,b=p;break;
		case 1:r=q,g=v,b=p;break;
		case 2:r=p,g=v,b=t;break;
		case 3:r=p,g=q,b=v;break;
		case 4:r=t,g=p,b=v;break;
		case 5:r=v,g=p,b=q;break;
	}return gfx.fillStyle=gfx.strokeStyle="rgb("+Math.floor(255*(1-r))+","+Math.floor(255*(1-g))+","+Math.floor(255*(1-b))+")";
}

var goldenAngle = 0.381966;
function hsva(h,s,v,a){
	var s = hsv(h,s,v);
	s = s.substring(0,3)+"a"+s.substring(3,s.length-1);
	return gfx.fillStyle=gfx.strokeStyle=s+","+a+")";
}

function drawHex(x,y,r){
	gfx.save();
	gfx.translate(x,y);
	gfx.beginPath();
	gfx.moveTo(0,r);
	gfx.lineTo(r/2*sq3,r/2);
	gfx.lineTo(r/2*sq3,-r/2);
	gfx.lineTo(0,-r);
	gfx.lineTo(-r/2*sq3,-r/2);
	gfx.lineTo(-r/2*sq3,r/2);
	gfx.lineTo(0,r);
	gfx.fill();
	gfx.restore();
};

var drawPath = function(cell,i){
	gfx.beginPath();
	var p0 = Math.min(cell.path[i],cell.path[i+1]);
	var p1 = Math.max(cell.path[i],cell.path[i+1]);
	switch(p0*10+p1){
		case  1:gfx.arc(48/2*sq3,48/2,48/2,5/6*Math.PI,3/2*Math.PI);break;
		case  2:gfx.arc(48/2*sq3,48*1.5,48*1.5,7/6*Math.PI,3/2*Math.PI);break;
		case  3:gfx.moveTo(48/2*sq3,0);gfx.lineTo(-48/2*sq3,0);break;
		case  4:gfx.arc(48/2*sq3,-48*1.5,48*1.5,1/2*Math.PI,5/6*Math.PI);break;
		case  5:gfx.arc(48/2*sq3,-48/2,48/2,1/2*Math.PI,7/6*Math.PI);break;
		case 12:gfx.arc(0,48,48/2,7/6*Math.PI,11/6*Math.PI);break;
		case 13:gfx.arc(-48/2*sq3,48*1.5,48*1.5,3/2*Math.PI,11/6*Math.PI);break;
		case 14:gfx.moveTo(48/4*sq3,48*3/4);gfx.lineTo(-48/4*sq3,-48*3/4);break;
		case 15:gfx.arc(48*sq3,0,48*1.5,5/6*Math.PI,7/6*Math.PI);break;
		case 23:gfx.arc(-48/2*sq3,48/2,48/2,3/2*Math.PI,1/6*Math.PI);break;
		case 24:gfx.arc(-48*sq3,0,48*1.5,-1/6*Math.PI,1/6*Math.PI);break;
		case 25:gfx.moveTo(-48/4*sq3,48*3/4);gfx.lineTo(48/4*sq3,-48*3/4);break;
		case 34:gfx.arc(-48/2*sq3,-48/2,48/2,11/6*Math.PI,1/2*Math.PI);break;
		case 35:gfx.arc(-48/2*sq3,-48*1.5,48*1.5,1/6*Math.PI,1/2*Math.PI);break;
		case 45:gfx.arc(0,-48,48/2,1/6*Math.PI,5/6*Math.PI);break;
	}gfx.stroke();
}

function textWidth(string,size,spacing){
	gfx.font = "800 "+size*1.37+"px helvetica";
	return gfx.measureText(string).width + (spacing * (string.length-1));
}

function text(string,x,y,size,spacing){
	gfx.textBaseline = "alphabetic";
	gfx.font = "800 "+size*1.37+"px helvetica";
	for(var i=0;i<string.length;++i){

		gfx.fillText(string.charAt(i),x,y+size);
		x += gfx.measureText(string.charAt(i)).width+spacing;
	}
}
