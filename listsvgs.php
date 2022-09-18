<?php
# List out all the contents of a directory as a json.
# 
# Type: GET
# Params:
# 	- subpath
#		Folder 
#
# Response: JSON showing all of the SVGS in the specified folder.

header('Content-Type: application/json');

$sp = $_GET["subpath"];
$indir = scandir(getcwd()."\\".$sp);

$ar = array();

function endsWith($haystack, $needle) {
    return substr_compare($haystack, $needle, -strlen($needle)) === 0;
}

for($i = 0; $i < sizeof($indir); $i++)
{
	if(!endsWith($indir[$i], ".svg"))
		continue;
	
	$obj = array();
	$obj["filename"] = $indir[$i];

	array_push($ar, $obj);
}


$json = json_encode($ar);
echo($json);
?>