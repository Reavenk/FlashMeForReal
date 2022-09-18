<?php
/* 
List out all the cvg contents of a directory as a bunch of
displayed SVGs
*/
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
	if(!endsWith($indir[$i], ".svg"))
		continue;
	
	$path = "./".$sp."/".$indir[$i];
	
	echo('<a href="'.$path.'">'.$path.'</a><br>');
	
	// The non-img version allows selecting and searching the inner elements.
	//echo('<img src="'. $path.'"><br>');
	echo('<object data="'.$path.'" type="image/svg+xml"></object>');
	echo("<hr>");
}
?>
	</center>
	</body>
</html>