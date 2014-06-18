function random(start, end) {
	var range = end - start;
	var randomNumber = Math.random() * range + start;
	return randomNumber;
}

function greaterThanZero(obj, property) {
	obj[property] = (obj[property] > 0 ? obj[property] : 0);
}

var Tree = function(parent, canvas) {
	var self = this;
	var attributes = {
		length: {
			initialValue: 65,
			varyBy: 10,
			min: 25,
			max: 100
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
			initialValue: 6,
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

	if (canvas) {
		self.canvas = canvas;
	}

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
		if (attribute.round) {
			newValue = Math.round(newValue);
		}

		self.attributes[attributeToRandomize] = newValue;
		render();
	}

	this.spawn = function() {
		var childCanvases = document.querySelectorAll(".tree");
		var tree;
		self.chidren = [];
		for (var i = 0; i < childCanvases.length; i++) {
			if (childCanvases[i] === self.canvas) {
				continue;
			}
			tree = new Tree(self, childCanvases[i]);
			self.chidren.push(tree);
			tree.randomize();
		}
	}
	
	function render() {
		if (!self.treeView) {
			self.treeView = new TreeView(self);
		}
		self.treeView.draw();
	}

	this.randomize();
};

/* Adapted from http://thecodeplayer.com/walkthrough/create-binary-trees-using-javascript-and-html5-canvas?s=rl */
var TreeView = function(tree) {
	this.canvas = tree.canvas || document.getElementById("root");
	var ctx = this.canvas.getContext("2d");
	//Lets resize the canvas to occupy the full page
	var W = this.canvas.offsetWidth;
	var H = this.canvas.offsetHeight;
	this.canvas.width = W;
	this.canvas.height = H;

	//Some variables
	var length, divergence, reduction, lineWidth, branchings, start_points = [];
	
	this.draw = function() {
		console.log(tree.attributes);

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
		var trunk = {x: W/2, y: length + 5, angle: 90};
		//It becomes the start point for branches
		start_points = []; //empty the start points on every init();
		start_points.push(trunk);
		
		//Y coordinates go positive downwards, hence they are inverted by deducting it
		//from the canvas height = H
		ctx.beginPath();
		ctx.moveTo(trunk.x, H - 5);
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

	this.canvas.addEventListener("click", function() {
		tree.spawn();		
	});
}

var root = new Tree();





