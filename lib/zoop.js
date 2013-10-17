
function zoop(Application) {

	var application = new Application();
	application.start();
	
	return function(req, res, next) {
		application.handleRequest(req, res, function(handled) {
			if(!handled) {
				console.log("Not handled request!");
				next();
			}  			
		});
	};

};

zoop.Class = require("./class");
zoop.Application = require("./application");
zoop.RESTService = require("./restservice");
zoop.Route = require("./route");

module.exports = zoop;
