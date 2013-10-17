var Class = require("./class");

var Application = Class.extend({

	init: function() {
		this.restservices = [];
	},
	
	start: function() {
	},	
	
	startRESTService: function(directory, modulename, basepath) {
		var RESTService = require(directory + "/" + modulename);
		var newRESTService = new RESTService(directory, basepath);
		this.restservices.push(newRESTService);
		
		newRESTService.start();
	},
	
	handleRequest: function(req, res, callback) {
		var restservices = this.restservices;
		
		for(var i in restservices) {
			var restservice = restservices[i];
			var path = req.path;
						
			if(path.indexOf(restservice.basepath) === 0) {
				restservice.handleRequest(req, res, callback);
				return;
			}
		}
		callback(false);
	}
	
});

module.exports = Application;
