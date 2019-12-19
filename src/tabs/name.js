

Typr.name = {};
Typr.name.parse = function(data, offset, length)
{
	var bin = Typr._bin;
	var obj = {};
	var format = bin.readUshort(data, offset);  offset += 2;
	var count  = bin.readUshort(data, offset);  offset += 2;
	var stringOffset = bin.readUshort(data, offset);  offset += 2;
	
	//console.warn(format,count);
	
	var names = [
		"copyright",
		"fontFamily",
		"fontSubfamily",
		"ID",
		"fullName",
		"version",
		"postScriptName",
		"trademark",
		"manufacturer",
		"designer",
		"description",
		"urlVendor",
		"urlDesigner",
		"licence",
		"licenceURL",
		"---",
		"typoFamilyName",
		"typoSubfamilyName",
		"compatibleFull",
		"sampleText",
		"postScriptCID",
		"wwsFamilyName",
		"wwsSubfamilyName",
		"lightPalette",
		"darkPalette"
	];
	
	var offset0 = offset;
	
	for(var i=0; i<count; i++)
	{
		var platformID = bin.readUshort(data, offset);  offset += 2;
		var encodingID = bin.readUshort(data, offset);  offset += 2;
		var languageID = bin.readUshort(data, offset);  offset += 2;
		var nameID     = bin.readUshort(data, offset);  offset += 2;
		var slen       = bin.readUshort(data, offset);  offset += 2;
		var noffset    = bin.readUshort(data, offset);  offset += 2;
		//console.warn(platformID, encodingID, languageID.toString(16), nameID, length, noffset);
		
		var cname = names[nameID];
		var soff = offset0 + count*12 + noffset;
		var str;
		if(false){}
		else if(platformID == 0) str = bin.readUnicode(data, soff, slen/2);
		else if(platformID == 3 && encodingID == 0) str = bin.readUnicode(data, soff, slen/2);
		else if(encodingID == 0) str = bin.readASCII  (data, soff, slen);
		else if(encodingID == 1) str = bin.readUnicode(data, soff, slen/2);
		else if(encodingID == 3) str = bin.readUnicode(data, soff, slen/2);
		
		else if(platformID == 1) { str = bin.readASCII(data, soff, slen);  console.warn("reading unknown MAC encoding "+encodingID+" as ASCII") }
		else throw "unknown encoding "+encodingID + ", platformID: "+platformID;
		
		var tid = "p"+platformID+","+(languageID).toString(16);//Typr._platforms[platformID];
		if(obj[tid]==null) obj[tid] = {};
		obj[tid][cname !== undefined ? cname : nameID] = str;
		obj[tid]._lang = languageID;
		//console.warn(tid, obj[tid]);
	}
	/*
	if(format == 1)
	{
		var langTagCount = bin.readUshort(data, offset);  offset += 2;
		for(var i=0; i<langTagCount; i++)
		{
			var length  = bin.readUshort(data, offset);  offset += 2;
			var noffset = bin.readUshort(data, offset);  offset += 2;
		}
	}
	*/
	
	//console.warn(obj);
	
	for(var p in obj) if(obj[p].postScriptName!=null && obj[p]._lang==0x0409) return obj[p];		// United States
	for(var p in obj) if(obj[p].postScriptName!=null && obj[p]._lang==0x0000) return obj[p];		// Universal
	for(var p in obj) if(obj[p].postScriptName!=null && obj[p]._lang==0x0c0c) return obj[p];		// Canada
	for(var p in obj) if(obj[p].postScriptName!=null) return obj[p];
	
	var tname;
	for(var p in obj) { tname=p; break; }
	console.warn("returning name table with languageID "+ obj[tname]._lang);
	return obj[tname];
}
