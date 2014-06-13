function random(length, start) {
	start = start || 0;
	return Math.floor(Math.random()*length) + start;
}

function greaterThanZero(obj, property) {
	obj[property] = (obj[property] > 0 ? obj[property] : 0);
}

var Node = function(parent){
	var self = this;
	this.div = document.getElementById("root");
	
	this.parent = parent || null;
	
	parent = parent || {};
	this.borderRadius = parent.borderRadius || 0;
	this.red = parent.red || 0;
	this.blue = parent.blue || 0;
	this.green = parent.green || 0;
	
	this.randomize = function() {
		this.borderRadius += random(9,-4);
		this.red += random(20,-9);
		this.blue += random(20,-9);
		this.green += random(20,-9);
		
		greaterThanZero(this, "borderRadius");
		greaterThanZero(this, "red");
		greaterThanZero(this, "blue");
		greaterThanZero(this, "green");

		render();
	}
	
	this.randomize();
	
	function render() {
		self.div.style.borderRadius = (self.borderRadius + "px")
		self.div.style.backgroundColor = "rgb(" + self.red + "," + self.green + "," + self.blue + ")";
	}
};

var root = new Node();

function run() {
	root.randomize();
	console.log(root)
}

run();

var button = document.getElementById("randomize");
button.addEventListener("click", function(){
	run();
})




