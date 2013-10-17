var Class = require("./class");

var RESTService = Class.extend({
	
	init: function(directory, basepath) {
		this.routes = [];
		this.basepath = basepath;
		this.directory = directory;
	},
	
	start: function() {
		
	},
	
	addRoute: function(route) {
		route.RESTService = this;
		this.routes.push(route);
	},
	
	handleRequest: function(req, res, callback) {
		for(var i in this.routes) {
			var route = this.routes[i];
			
			if(route.match(req)) {
				route.handleRequest(req, res, callback);
				return;
			}
		}
		callback(false);
	}
	
});

module.exports = RESTService;
