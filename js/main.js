(function() {
	var Utilities = {
		random: function(start, end) {
			var range = end - start;
			var randomNumber = Math.random() * range + start;
			return randomNumber;
		},

		minMax: function(value, min, max) {
			if (typeof min !== "undefined") {
				value = value < min ? min : value;
			}
			if (typeof max !== "undefined") {
				value = value > max ? max : value;
			}
			return value;
		},

		roundTo: function(num, decimalPlaces) {
			return Math.round(num * 10 * decimalPlaces) / (10 * decimalPlaces)
		},

		copyObject: function(originalObject) {
			return JSON.parse(JSON.stringify(originalObject));
		},

		toHash: function(str) {
			var hash = 0;
			if (str.length == 0) {
				return hash;
			}
			for (i = 0; i < str.length; i++) {
				char = str.charCodeAt(i);
				hash = ((hash<<5)-hash)+char;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		}
	};

	var CONSTS = {
		TREE_COUNT: 9
	};

	var ATTRIBUTES = {
		length: {
			initialValue: 65,
			varyBy: 10,
			min: 25,
			max: 100
		},
		divergence: {
			initialValue: 35,
			varyBy: 30,
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

	var TreeModel = function(parent) {
		var self = this;
		var attributeNamesArray = [];

		parent = parent || {attributes:{}};
		this.attributes = {};

		// Takes an optional parent - to allow for re-initialization.
		this.initialize = function(parentTree) {
			parent = parentTree || parent;
			for (var attributeName in ATTRIBUTES) {
				attributeNamesArray.push(attributeName);
				self.attributes[attributeName] = parent.attributes[attributeName] || ATTRIBUTES[attributeName].initialValue;
			}
			self.randomize();
		};
		
		this.randomize = function() {
			// Selecting a random attribute
			var attributeToRandomize = attributeNamesArray[Math.floor(Math.random()*attributeNamesArray.length)];
			var attribute = ATTRIBUTES[attributeToRandomize];
			var varyBy = attribute.varyBy;

			// Adding/subtracting a random amount from that attribute
			var newValue = self.attributes[attributeToRandomize] + Utilities.random(-1*varyBy, varyBy);

			// Ensuring that the value is within the bounds, and properly rounded.
			newValue = Utilities.minMax(newValue, attribute.min, attribute.max);
			if (attribute.round) {
				newValue = Math.round(newValue);
			} else {
				// Otherwise, just round to max 3 decimal places.
				newValue = Utilities.roundTo(newValue, 2)
			}

			self.attributes[attributeToRandomize] = newValue;
		};

		this.getAttributes = function() {
			return Utilities.copyObject(self.attributes);
		};

		this.setAttributes = function(attributes) {
			console.log("setAttributes", attributes);
			if (Array.isArray(attributes)) {
				for (var i = 0; i < attributes.length; i++) {
					self.attributes[attributeNamesArray[i]] = parseFloat(attributes[i]);
				}
			} else {
				for (var attributeName in attributes) {
					self.attributes[attributeName] = parseFloat(attributes[attributeName]);
				}
			}
		}

		this.initialize();
	};


	/* Adapted from http://thecodeplayer.com/walkthrough/create-binary-trees-using-javascript-and-html5-canvas?s=rl */
	var TreeView = function(canvas) {
		var ctx = canvas.getContext("2d");
		//Lets resize the canvas to occupy the full page
		var W = canvas.offsetWidth;
		var H = canvas.offsetHeight;
		canvas.width = W;
		canvas.height = H;

		//Some variables
		var length, divergence, reduction, lineWidth, branchings, start_points = [];
		
		this.draw = function(attributes) {
			//filling the canvas white
			ctx.clearRect (0, 0, W, H);
			
			//Lets draw the trunk of the tree
			//length of the trunk - 100-150
			length = attributes.length;
			//angle at which branches will diverge - 10-60
			divergence = attributes.divergence;
			//Every branch will be 0.75times of the previous one - 0.5-0.75
			reduction = attributes.reduction;
			//width of the branch/trunk
			lineWidth = attributes.lineWidth;
			//number of branchings
			branchings = attributes.branchings;
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

		this.setRoot = function() {
			canvas.classList.add("root");
		}

		this.unsetRoot = function() {
			canvas.classList.remove("root");
		}

		this.onClick = function(callback) {
			canvas.addEventListener("click", function() {
				callback();
			});
		}
	}

	var TreeController = (function() {
		var root;
		var trees = new Array(CONSTS.TREE_COUNT);
		var treeCanvases = document.querySelectorAll(".tree");
		var attributeHashes = [];
		var ignoreHash;

		function getAttributesHash(attributes) {
			var hash = "";
			for (var attributeName in attributes) {
				hash += attributes[attributeName] + "_";
			}
			return hash.substring(0, hash.length - 1);
		}

		function setupTree(index, parent) {
			if (!trees[index]) {
				tree = trees[index] =  {};
				tree.model = new TreeModel(parent);
				tree.view = new TreeView(treeCanvases[index]);
				tree.view.onClick(function() {
					spawnChildren(index);
				})
			} else {
				tree = trees[index];
				tree.model.initialize(parent);
			}
			tree.view.draw(tree.model.getAttributes());
			attributeHashes[index] = getAttributesHash(tree.model.getAttributes());
			return tree;
		}

		function spawnChildren(index, skipHash) {
			root.view.unsetRoot()
			root = trees[index];
			root.view.setRoot();
			for (var i = 0; i < trees.length; i++) {
				if (i === index) {
					continue;
				}
				setupTree(i, root.model);
			}
			if (!skipHash) {
				// Set a flag, so the hash watched doesn't fire.
				ignoreHash = true;
				hasher.setHash(attributeHashes.join(","));
				ignoreHash = false;
			}
		}

		// function to read the hash value and use it as the tree attributes.
		function readHash(hash) {
			if (ignoreHash) {
				return;
			}
			var attributeSets = hash.split(",");
			trees.forEach(function(tree, index) {
				tree.model.setAttributes(attributeSets[index].split("_"))
				tree.view.draw(tree.model.getAttributes())
			});
		}

		function init() {
			root = setupTree(0);
			spawnChildren(0, true);

			hasher.initialized.add(readHash); //add initialized listener (to grab initial value in case it is already set)
			hasher.changed.add(readHash);
			hasher.init(); //initialize hasher (start listening for history changes)
		}

		return {
			init: init
		}
	})();

	TreeController.init();
})();