
var mongo = function(log)
{

	var MongoDB		= require('mongodb').Db;
	var Server		= require('mongodb').Server;
	var ObjectId 	= require('mongodb').ObjectID;

	/*
		ESTABLISH DATABASE
	*/

	var dbName = process.env.DB_NAME || 'pushpop';
	var dbHost = process.env.DB_HOST || 'localhost'
	var dbPort = process.env.DB_PORT || 27017;

	var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	var projects = db.collection('projects');

	db.open(function(e, d){
		if (e) {
			log(e);
		} else {
			if (process.env.NODE_ENV == 'live') {
				db.authenticate(process.env.DB_USER, process.env.DB_PASS, function(e, res) {
					if (e) {
						log('mongo :: error: not authenticated', e);
					}
					else {
						log('mongo :: authenticated and connected to database :: "'+dbName+'"');
					}
				});
			}	else{
				log('mongo :: connected to database :: "'+dbName+'"');
			}
		}
	});

	/*
		public methods
	*/

	this.get = function(pName, cback)
	{
	// get the requested project if it exists //
		projects.findOne({ name:pName }, function(e, project){
			if (project){
				cback(project);
			}	else{
		// otherwise return a new empty project //
				var project = getNewProjectObject(pName);
				projects.insert(project, { safe:true }, function(e, result){
					cback(project);
				});
			}
		});
	}

	this.getAll = function(cback)
	{
		projects.find({ }).sort({'date':-1,'name':1}).toArray(function(e, a) { cback(a); });
	}

	this.save = function(project, cback)
	{
		projects.save(project, { safe:true }, cback);
	}

	this.delete = function(project, cback)
	{
		projects.remove({ _id:new ObjectId(project) }, cback);
	}

	this.reset = function(cback)
	{
		projects.remove({}, cback);
	}

	var getNewProjectObject = function(pName)
	{
		return {
			name : pName,
			media : [],
			last_updated : new Date() 
		}
	}
}

module.exports = function(logFunc) 
{
	return new mongo(logFunc);
};


