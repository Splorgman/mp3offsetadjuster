var fs = require('fs');
var util = require('util');
var parser = require('xml2js');
var nodeid3 = require('node-id3');

fs.readFile(process.argv[2], function (err, data) {
	parser.parseString(data, function(err, result) {
		for (var i = 0, ilen = result.NML.COLLECTION[0].$.ENTRIES; i < ilen; i++) {
			var entry = (result.NML.COLLECTION[0].ENTRY[i]);
			if (entry === undefined) {
				continue;
			}

			var offset = 0;

			for (var x = 0, xlen = entry.CUE_V2.length; x < xlen; x++) {
				if (entry.CUE_V2[x].$.TYPE === "0") {
					offset = (entry.CUE_V2[x].$.START)/1000;
					break;
				}
			}
			
			var directory = entry.LOCATION[0].$.DIR;
			directory = directory.replace(/:/g,"");
			var fileLocation = entry.LOCATION[0].$.VOLUME + directory + entry.LOCATION[0].$.FILE;
			if (fs.existsSync(fileLocation)) {
				console.log('\x1b[36m',"Updating " + fileLocation + " with an offset of " + offset);
				var tags = {
					"COMM": {
						"language": "eng",
						"text": '{"Offset": ' + offset + '}'
					}
				}

				var success = nodeid3.update(tags, fileLocation);
				if (success !== true) {
					console.log('\x1b[31m',"Failed to update " + fileLocation);
				}
			} else {
				console.log('\x1b[31m',"Could not find " + fileLocation + ", skipping!");
			};
		}
	});
});

console.log('\x1b[0m',"MP3 updates complete!");