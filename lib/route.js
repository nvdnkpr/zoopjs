var Class = require("./class"), 
	_ = require("underscore"),
	fs = require("fs");
	
var optionalParam = /\((.*?)\)/g,
 	namedParam = /(\(\?)?:\w+/g,
	splatParam = /\*\w+/g,
	escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g,
	placeHolder = /\{[0-9]+\}/g;

var Route = Class.extend({
	
	init: function(routedata) {
		this.routedata = routedata;
		this.routeregexp = this._routeToRegExp(routedata.path);
	},
	
	match: function(req) {
		if(!(this.routedata.verb === req.method || this.routedata.verb === "ALL")) return false;
				
		var basepath = this.RESTService.basepath;
		return this.routeregexp.test(req.path.replace(basepath, ""));
	},
	
	handleRequest: function(req, res, callback) {
		var basepath = this.RESTService.basepath;
		var controllersdir = this.RESTService.directory + "/controllers";
		var params = this._getParameters(this.routeregexp, req.path.replace(basepath, ""));
		var controllername = this._substituteParameters(this.routedata.controller, params) + "controller";
		var actionname =  this._substituteParameters(this.routedata.action, params);
		var controllerpath = controllersdir + "/" + controllername + ".js";
		if(fs.existsSync(controllerpath)) {
			var Controller = require(controllerpath);
			var controllerinstance = new Controller();
			if(actionname in controllerinstance) {
				controllerinstance.params = params;
				controllerinstance[actionname].call(controllerinstance, function(result) {
					if(result) {
						res.setHeader("Content-Type", "text/json");
						res.send(JSON.stringify(result));
						callback(true);
					} else {
						callback(false);
					}
				});
			}			
		} else {
			callback(false);
		}
	},
	
	_routeToRegExp: function(route) {
		route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function(match, optional) {
			return optional ? match : '([^\/]+)';
		}).replace(splatParam, '(.*?)');
		return new RegExp('^' + route + '$');
	},
	
	_getParameters : function(route, path) {
		var keys = this._extractParameters(route, this.routedata.path);
		var values = this._extractParameters(route, path);
		var params = {};
		for(var i = 0, l = keys.length; i < l; i++) {
			var paramname = /[\w]+/g.exec(keys[i]);
			params[paramname] = values[i];
		}
		return params;
	},
	
	_extractParameters : function(route, path) {
		var params = route.exec(path).slice(1);
		return _.map(params, function(param) {
			return param ? decodeURIComponent(param) : null;
		});
	},
	
	_substituteParameters : function(str, params) {
		var placeholders = str.match(/{[\w]+}/g);
		if(!placeholders) return str;
		
		for(var i = 0, l = placeholders.length; i < l; i++) {
			var placeholder = placeholders[i];
			var placeholdername = /[\w]+/g.exec(placeholder);
			if(placeholdername in params) {
				str = str.replace(new RegExp(placeholder, "g"), params[placeholdername]);
			}
		}
		return str;
	}
});

module.exports = Route;
