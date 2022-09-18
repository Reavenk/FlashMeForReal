<?php
/*
List all the folder and any extra metadata in the directory.
*/
header('Content-Type: application/json');

$ar = array();

$indir = array_filter(glob('Cards/*'), 'is_dir');
for($i = 0; $i < sizeof($indir); $i++)
{
	$dirname = $indir[$i];
	$obj["path"] = $dirname;
	
	$jsonMetapath = $dirname."/meta.json";
	if(file_exists($jsonMetapath))
	{
		$jsonString = file_get_contents($jsonMetapath);
		$obj["data"] = json_decode($jsonString);
	}
	$jsonMetapath = null;
	
	$ar[$dirname] = $obj;
	echo($jsonMetapath);
	$obj = null;
}

$json = json_encode($ar, JSON_PRETTY_PRINT);
echo($json);
?>