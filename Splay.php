<?php
# List out all the cvg contents of a directory as a bunch of
# displayed SVGs.
#
# This can be used to view all the contents of a folder to search
# and inventory the contents.
# 
# Type: GET
# Params:
#	- subpath
#		Folder on the server to process.
#
# Response: Webpage showing all of the SVGs in the specified folder.
?>

<html>
	<head></head>
	<body>
	<center>
	
<?php
$sp = $_GET["subpath"];
//echo(getcwd()."\\".$sp);
$indir = scandir(getcwd()."\\".$sp);
//print_r($indir);

function endsWith($haystack, $needle) {
    return substr_compare($haystack, $needle, -strlen($needle)) === 0;
}

for($i = 0; $i < sizeof($indir); $i++)
{
	// Find all SVG files
	if(!endsWith($indir[$i], ".svg"))
		continue;
	
	$path = "./".$sp."/".$indir[$i];
	
	// Place a link to them
	echo('<a href="'.$path.'">'.$path.'</a><br>');
	
	// Embed the svgs in the HTML document.
	//
	// The non-img version allows selecting and searching the inner elements.
	//echo('<img src="'. $path.'"><br>');
	echo('<object data="'.$path.'" type="image/svg+xml"></object>');
	echo("<hr>");
}
?>
	</center>
	</body>
</html>