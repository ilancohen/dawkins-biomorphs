function random(start, end) {
	var range = end - start;
	var randomNumber = Math.random() * range + start;
	return randomNumber;
}

function greaterThanZero(obj, property) {
	obj[property] = (obj[property] > 0 ? obj[property] : 0);
}

var Tree = function(parent) {
	var self = this;
	var attributes = {
		length: {
			initialValue: 125,
			varyBy: 10,
			min: 100,
			max: 150
		},
		divergence: {
			initialValue: 35,
			varyBy: 10,
			min: 5,
			max: 70
		},
		reduction: {
			initialValue: 0.625,
			varyBy: 0.3,
			min: 0.5,
			max: 0.75
		},
		lineWidth: {
			initialValue: 10,
			varyBy: 0
		},
		branchings: {
			initialValue: 0,
			varyBy: 2,
			min: 0,
			max: 8,
			round: true
		}
	};
	var attributesArray = [];

	this.parent = parent || null;
	parent = parent || {attributes:{}};

	this.attributes = {};
	for (var attributeName in attributes) {
		attributesArray.push(attributeName);
		this.attributes[attributeName] = parent.attributes[attributeName] || attributes[attributeName].initialValue
	}
	
	this.randomize = function() {
		var attributeToRandomize = attributesArray[Math.floor(Math.random()*attributesArray.length)];
		var attribute = attributes[attributeToRandomize];
		var varyBy = attribute.varyBy;
		var newValue = self.attributes[attributeToRandomize] + random(-1*varyBy, varyBy);

		if (typeof attribute.min !== "undefined") {
			newValue = newValue < attribute.min ? attribute.min : newValue;
		}
		if (typeof attribute.max !== "undefined") {
			newValue = newValue > attribute.max ? attribute.max : newValue;
		}
		self.attributes[attributeToRandomize] = newValue;
		render();
	}
	
	this.randomize();
	
	function render() {
		console.log(self.attributes);
		if (!self.treeView) {
			self.treeView = new TreeView(self);
		}
		self.treeView.draw();
	}
};

var TreeView = function(tree) {
	this.canvas = document.getElementById("canvas");
	var ctx = this.canvas.getContext("2d");
	//Lets resize the canvas to occupy the full page
	var W = window.innerWidth;
	var H = window.innerHeight;
	this.canvas.width = W;
	this.canvas.height = H;

	//Some variables
	var length, divergence, reduction, lineWidth, branchings, start_points = [];
	
	this.draw = function() {
		//filling the canvas white
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, W, H);
		
		//Lets draw the trunk of the tree
		//length of the trunk - 100-150
		length = tree.attributes.length;
		//angle at which branches will diverge - 10-60
		divergence = tree.attributes.divergence;
		//Every branch will be 0.75times of the previous one - 0.5-0.75
		reduction = tree.attributes.reduction;
		//width of the branch/trunk
		lineWidth = tree.attributes.lineWidth;
		//number of branchings
		branchings = tree.attributes.branchings;
		branchings ? branchings < 0 : 0;

		//This is the end point of the trunk, from where branches will diverge
		var trunk = {x: W/2, y: length + 50, angle: 90};
		//It becomes the start point for branches
		start_points = []; //empty the start points on every init();
		start_points.push(trunk);
		
		//Y coordinates go positive downwards, hence they are inverted by deducting it
		//from the canvas height = H
		ctx.beginPath();
		ctx.moveTo(trunk.x, H - 50);
		ctx.lineTo(trunk.x, H - trunk.y);
		ctx.strokeStyle = "brown";
		ctx.lineWidth = lineWidth;
		ctx.stroke();
		
		branches();
	}

	//Lets draw the branches now
	function branches(callNum) {
		callNum = callNum || 0;

		//reducing lineWidth and length
		length = length * reduction;
		lineWidth = lineWidth * reduction;
		ctx.lineWidth = lineWidth;
		
		var new_start_points = [];
		ctx.beginPath();
		for(var i = 0; i < start_points.length; i++) {
			var sp = start_points[i];
			//2 branches will come out of every start point. Hence there will be
			//2 end points. There is a difference in the divergence.
			var ep1 = get_endpoint(sp.x, sp.y, sp.angle + divergence, length);
			var ep2 = get_endpoint(sp.x, sp.y, sp.angle - divergence, length);
			
			//drawing the branches now
			ctx.moveTo(sp.x, H - sp.y);
			ctx.lineTo(ep1.x, H - ep1.y);
			ctx.moveTo(sp.x, H - sp.y);
			ctx.lineTo(ep2.x, H - ep2.y);
			
			//Time to make this function recursive to draw more branches
			ep1.angle = sp.angle + divergence;
			ep2.angle = sp.angle - divergence;
			
			new_start_points.push(ep1);
			new_start_points.push(ep2);
		}
		//Lets add some more color
		if (length < 10) {
			ctx.strokeStyle = "green";
		} else {
			ctx.strokeStyle = "brown";
		}
		ctx.stroke();
		start_points = new_start_points;
		//recursive call - only if length is more than 2.
		//Else it will fall in an long loop
		if (callNum < branchings) {
			setTimeout(function(){
				branches(callNum+1);
			}, 50);
		}
	}
	
	function get_endpoint(x, y, a, length) {
		//This function will calculate the end points based on simple vectors
		//http://physics.about.com/od/mathematics/a/VectorMath.htm
		//You can read about basic vectors from this link
		var epx = x + length * Math.cos(a * Math.PI/180);
		var epy = y + length * Math.sin(a * Math.PI/180);
		return {x: epx, y: epy};
	}
}

var root = new Tree();

function run() {
	root.randomize();
}

run();

var button = document.getElementById("randomize");
button.addEventListener("click", function(){
	run();
})




