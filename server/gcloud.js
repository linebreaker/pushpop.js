
var gcloud = function(bucketName)
{
	var gcloud;
	console.log('connecting to gcloud :: ', bucketName)
	if (process.env.GCLOUD_KEY_FILE){
		gcloud = require('gcloud')({
			projectId: process.env.GCLOUD_PROJECT,
			keyFilename: process.env.GCLOUD_KEY_FILE,
		});
	}	else{
		gcloud = require('gcloud')({
			projectId: process.env.GCLOUD_PROJECT,
			credentials: JSON.parse(process.env.GCLOUD_JSON) 
		});
	}
	var bucket = gcloud.storage().bucket(bucketName);
/*
	bucket must first be made public for access over http
	http://goo.gl/z5Rm2R
*/
	bucket.makePublic(function(e, response){
		if (e){
			console.log('unable to connnect to gcloud', e);
		}	else{
			if (response[0][0].entity == 'allUsers' && response[0][0].role == 'READER'){
				console.log('gcloud :: bucket', bucketName, 'is publicly visible');
			}
		}
	});

	this.listFiles = function(path, cback)
	{
		bucket.getFiles({ prefix:path }, function(e, files) {
			if (e) {
				console.log(e);
			}	else{
				var a = [];
				for (var i=0; i<files.length; i++){
				// ignore empty directories & thumbnails //
					if (files[i].metadata.size != 0 && files[i].name.search('_thumb') != -1){
						a.push({
							'name' : files[i].name,
							'date' : files[i].metadata.updated,
							'size' : (files[i].metadata.size/1024/1024).toFixed(2) + 'MB'
						});
					}
				};
			// return list of files sorted by date descending //
				a.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
				cback(a);
			}
		});
	}
	this.uploadImage = function(file, destination, cback)
	{
		bucket.upload(file, { destination: bucket.file(destination) }, cback);
	}
	this.deleteImage = function(file, cback)
	{
		bucket.deleteFiles({ prefix: file }, cback);
	}
	this.deleteProject = function(project_id, cback)
	{
		bucket.deleteFiles({ prefix: project_id }, cback);
	}
}

module.exports = function(bucketName) 
{
	return new gcloud(bucketName);
};



