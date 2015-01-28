//==  GLOBAL VARIABLES  ======================================================//

var overlay = 1; // 0 = none | 1 = title | 2 = win
var overlayGoal = 0.8;
var overlayAlpha = 4;
var overlayBig = "Torxion";
var overlaySub = "Click to begin";
var padding = 48;
var menuHeight = 64;
var diffHover = 0; // -1 = none | 0 = easy | 1 = med | 2 = hard
var diffGoal = [0,0,0];
var diffAlpha = [0,0,0];
var lastDifficulty = 1;
var sq3 = Math.sqrt(3);
var cellLs;
var markerLs;
var edgeCellLs;
var fillLs = [];
var fading = false;
var evaluate = false;
var lastEvalReqTick = -1;
var cellCtr = 0;
var width,height,scale;

//==  GRID GENERATION  =======================================================//

var cell = function(){
	this.id = ++cellCtr+".";
	this.path = []; // 0-1 | 2-3 | 4-5
	this.used = [false,false,false,false,false,false];
	this.adjacent = [null,null,null,null,null,null]; // E SE SW W NW NE
	this.markers = [null,null,null,null,null,null]; // E SE SW W NW NE
	this.rotation = 0; // cw = + | ccw = - [ when this is a float,treat as its rendered rotation,treat discrete rot as invalid ]
	this.goalRotation = 0; // when rotating tile,modify this value instead of rotation
	this.x;this.y;

	this.shadow = function(){
		this.rotation+=(this.goalRotation-this.rotation)*elapsed*0.03;
		if(this.goalRotation !== this.rotation && Math.abs(this.goalRotation-this.rotation)<0.01)this.rotation = this.goalRotation;
		gfx.save();
		gfx.translate(this.x,this.y);
		gfx.rotate(this.rotation*Math.PI/3);
		gfx.shadowBlur = 4;
		gfx.shadowColor = rgb(0.1,0.1,0.1);drawHex(0,0,48-2);
		gfx.lineCap = "round";rgb(0.1,0.1,0.1);gfx.lineWidth = 19;
		gfx.beginPath();
		gfx.moveTo(48/2*sq3,0);gfx.lineTo(-48/2*sq3,0);
		gfx.moveTo(48/4*sq3,48*3/4);gfx.lineTo(-48/4*sq3,-48*3/4);
		gfx.moveTo(-48/4*sq3,48*3/4);gfx.lineTo(48/4*sq3,-48*3/4);
		gfx.stroke();
		for(var i=0;i<this.path.length;i+=2)drawPath(this,i);
		gfx.restore();
		return this.rotation === this.goalRotation;
	}

	this.render = function(){
		gfx.save();
		gfx.translate(this.x,this.y);
		gfx.rotate(this.rotation*Math.PI/3);
		rgb(0.6,0.6,0.6);drawHex(0,0,48-7);
		for(var i=0;i<this.path.length;i+=2){
			rgb(0.1,0.1,0.1);gfx.lineWidth = 19;drawPath(this,i);
			gfx.lineCap = "round";
			rgb(0.9,0.9,0.9);gfx.lineWidth = 10;drawPath(this,i);
			gfx.lineCap = "butt";
		}gfx.restore();
	};

	this.highlight = function(){
		gfx.save();
		gfx.translate(this.x,this.y);
		drawPath(this,0);
		gfx.restore();
	};

	this.rotateCW  = function(){++this.goalRotation;};
	this.rotateCCW = function(){--this.goalRotation;};
};

var marker = function(attach,side,color){
	this.attachedTo = attach;
	this.side = side; // 0-5,side marker is attached to on cell
	this.color = color; // what color
	this.partner = null; // marker this should connect to

	this.update = function(){};

	this.belowRender = function(){
		gfx.save();
		gfx.translate(this.attachedTo.x,this.attachedTo.y);
		var r = this.side*1/3*Math.PI;
		gfx.shadowColor = hsv(this.color,1,1);
		gfx.shadowBlur = 8;
		gfx.lineWidth = 27;
		hsv(this.color,1,1);
		gfx.beginPath();
		gfx.lineCap = "round";
		gfx.moveTo(0,0);
		var q = 6;
		gfx.lineTo(Math.cos(r)*(48-q),Math.sin(r)*(48-q));
		gfx.stroke();

		gfx.restore();
	};

	this.render = function(){
		gfx.save();
		gfx.translate(this.attachedTo.x,this.attachedTo.y);
		var r = this.side*1/3*Math.PI;
		gfx.shadowColor = hsv(this.color,1,1);
		gfx.shadowBlur = 4;
		gfx.lineWidth = 4;
		gfx.beginPath();
		gfx.lineCap = "round";
		gfx.moveTo(Math.cos(r)*(48-5.9),Math.sin(r)*(48-5.9));
		var q = 6;
		gfx.lineTo(Math.cos(r)*(48-q),Math.sin(r)*(48-q));
		gfx.stroke();

		gfx.restore();
	};
};

function generateGrid(minDepth,markerPairs,preGrid){
	// initializes cells,grid,and cellLs
	cellLs = [];
	edgeCellLs = [];
	fillLs = [];
	for(var i=0;i<preGrid.length;++i)
	for(var j=0;j<preGrid[i].length;++j)
	if(preGrid[i][j] === 1){
		var c = new cell();
		preGrid[i][j] = c;
		cellLs.push(c);
	}else preGrid[i][j] = null;

	// transpose grid
	var grid = preGrid[0].map(function(col,i){
		return preGrid.map(function(row){
			return row[i];
		});
	});

	// initialize pointers and coordinates
	var minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
	for(var i=0;i<grid.length;++i)
	for(var j=0;j<grid[i].length;++j)
	if(grid[i][j] !== null){
		var x = grid[i][j].x =(-(j-Math.floor(grid.length/2))+2*i-2*Math.floor(grid[0].length/2))*48/2*sq3;
		var y = grid[i][j].y =(1.5*48*j)-1.5*48*Math.floor(grid.length/2);
		if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
		if(i<grid.length-1)                     grid[i][j].adjacent[0]=grid[i+1][j  ];
		if(i<grid.length-1&&j<grid[i].length-1) grid[i][j].adjacent[1]=grid[i+1][j+1];
		if(j<grid[i].length-1)                  grid[i][j].adjacent[2]=grid[i  ][j+1];
		if(i>0)                                 grid[i][j].adjacent[3]=grid[i-1][j  ];
		if(i>0&&j>0)                            grid[i][j].adjacent[4]=grid[i-1][j-1];
		if(j>0)                                 grid[i][j].adjacent[5]=grid[i  ][j-1];
		for(var k=0;k<6;++k){
			if(grid[i][j].adjacent[k] === null){
				edgeCellLs.push(grid[i][j]);
				break;
			}
		}
	}

	minX -= 48/2*sq3;
	maxX += 48/2*sq3;
	minY -= 48;
	maxY += 48;

	width  =(maxX-minX)/48;
	height =(maxY-minY)/48;

	// initialize markers
	markerLs = [];
	shuffle(edgeCellLs);
	var markers = 0;
	fullList: for(var i in edgeCellLs){
		var c = edgeCellLs[i];
		var dir,m0,m1;
		for(var k = 0; k < 6; k++){
			if((c.adjacent[k] != null) ||(c.markers[k] != null))continue;
			var dir = k;
			m0 = new marker(c,dir,markers * goldenAngle + 0.3);
			c.markers[dir] = m0;
			var destCell,destDir;
			var recurse = function(fromCell,fromDir,depth){
				if(depth > 0)fromDir = (fromDir+3)%6;
				var adjLs = [0,1,2,3,4,5];
				adjLs.splice(fromDir,1);
				shuffle(adjLs);
				for(var a=0;a<6;++a){
					if(fromCell.used[adjLs[a]])continue;
					fromCell.used[fromDir] = true;
					fromCell.used[adjLs[a]] = true;
					fromCell.path.push(fromDir);
					fromCell.path.push(adjLs[a]);

					var clear = function(){
						fromCell.used[fromDir] = false;
						fromCell.used[adjLs[a]] = false;
						fromCell.path.pop();
						fromCell.path.pop();
					}

					var d = fromCell.adjacent[adjLs[a]];
					if(d !== null && d !== undefined){
						if(recurse(d,adjLs[a],depth + 1))return true;
						else{clear();continue;}
					}else if(fromCell.markers[adjLs[a]]){clear();continue;}
					else if(depth < minDepth){clear();continue;}
					else{
						destCell = fromCell;
						destDir = adjLs[a];
						m1 = new marker(destCell,destDir,markers*goldenAngle+0.3);
						destCell.markers[adjLs[a]] = m1;
						return true;
					}
				}return false;
			};

			if(!recurse(c,dir,0)){
				c.markers[dir] = null;
				continue;
			}

			m0.partner = m1;
			m1.partner = m0;
			markerLs.push(m0);
			markerLs.push(m1);
			++markers;
			if(markers === markerPairs)break fullList;
		}
	}

	// add rest of paths
	for(var i in cellLs){
		var c = cellLs[i];
		if(c.path.length === 6)continue;
		var indicies = c.used.map(function(b,i){if(!b)return i;}).filter(function(e){return e !== undefined;});
		shuffle(indicies);
		c.path = c.path.concat(indicies);
	}

	// randomize rotations
	for(var i in cellLs)cellLs[i].goalRotation+=rInt(6)-3;
	requestEval();
	window.onresize();
};

function requestEval(){
	if(lastEvalReqTick === tick)return;
	lastEvalReqTick = tick;
	evaluate = true;
	requestAnimationFrame(render);
};

var firstEval = true;
function evalPaths(){
	var connected = 0;
	for(var i=0;i<fillLs.length;++i)fillLs[i][3] = 0;
	for(var i=0;i<markerLs.length;i+=2){
		var tracedPath = [];
		var hash = "";
		var recurse = function(fromCell,fromSide,originMkr){
			fromSide =(fromSide-fromCell.goalRotation).mod(6);
			var toSide;
			for(var i=0;i<6;++i)if(fromCell.path[i] === fromSide){
				if(i%2 === 0)toSide = fromCell.path[i+1];
				else toSide = fromCell.path[i-1];
				break;
			}toSide =(toSide+fromCell.goalRotation).mod(6);

			var saveCell = function(){
				var c = new cell();
				c.path.push((fromSide+fromCell.goalRotation).mod(6));
				c.path.push(toSide);
				c.x = fromCell.x;
				c.y = fromCell.y;
				tracedPath.push(c);
				hash += fromCell.id;
			}

			if(fromCell.adjacent[toSide] === null){
				if(fromCell.markers[toSide] === null)return false;
				else if(fromCell.markers[toSide].partner === originMkr){
					saveCell();
					return true;
				}else return false;
			}else{
				if(recurse(fromCell.adjacent[toSide],(toSide+3)%6,originMkr)){
					saveCell();
					return true;
				}else return false;
			}
		};

		var m = markerLs[i];
		recurse(m.attachedTo,m.side,m);
		if(tracedPath.length > 0){
			++connected;
			var hashFound = false;
			for(var q in fillLs){
				var f = fillLs[q];
				if(f[4] !== hash)continue;
				hashFound = true;
				f[3] = 1;
				break;
			}if(!hashFound)fillLs.push([m.color,tracedPath,0,1,hash]);
		}
	}

	if(firstEval)firstEval = false;
	else if(connected*2 === markerLs.length){
		overlayBig = "You Win!";
		overlaySub = "Click to start new game";
		overlay = 2;
		overlayGoal = 0.8;
	}
};

function menuHover(diff){
	if(diffHover === diff)return;
	requestAnimationFrame(render);
	diffHover = diff;
	diffGoal = [0,0,0];
	if(diff>=0)diffGoal[diff] = 1;
};

function renderMenu(){
	var animating = false;

	for(var d=0;d<3;++d){
		diffAlpha[d] +=(diffGoal[d]-diffAlpha[d])*elapsed*0.03;
		if(Math.abs(diffAlpha[d]-diffGoal[d])<0.01)diffAlpha[d] = diffGoal[d];
		if(diffAlpha[d] === 0)continue;
		if(diffGoal[d] !== diffAlpha[d])animating = true;

		var txt;
		switch(d){
			case 0:txt = "Easy";break;
			case 1:txt = "Medium";break;
			case 2:txt = "Hard";break;
		}

		gfx.save();
			gfx.shadowColor = rgba(0.1,0.1,0.1,diffAlpha[d]);
			gfx.shadowBlur = 8;
			var w = textWidth(txt,32,-3);
			text(txt,ww/2-w/2,wh-64-28,32,-3);
		gfx.restore();
		rgba(0.9,0.9,0.9,diffAlpha[d]);
		text(txt,ww/2-w/2,wh-64-28,32,-3);
	}

	gfx.save();
	gfx.lineCap = "round";gfx.shadowBlur = 8;gfx.lineWidth = 8;
	gfx.shadowColor=hsv(0.3+goldenAngle*4,1,1);gfx.beginPath();gfx.moveTo(ww/2-8-64,wh-32);gfx.lineTo(ww/2+8-64,wh-32);gfx.stroke();
	gfx.shadowColor=hsv(0.3+goldenAngle*2,1,1);gfx.beginPath();gfx.moveTo(ww/2-8,wh-32);gfx.lineTo(ww/2+8,wh-32);gfx.stroke();
	gfx.shadowColor=hsv(0.3+goldenAngle*3,1,1);gfx.beginPath();gfx.moveTo(ww/2-8+64,wh-32);gfx.lineTo(ww/2+8+64,wh-32);gfx.stroke();
	gfx.restore();

	return animating;
};
