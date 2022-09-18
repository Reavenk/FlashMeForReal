<html>
	<head>
		<title></title>
	</head>
	<body>
<?php
# List all directories, with links to go to their specific splays.
#
# Type: GET
# Response: HTML webpage, with a directory of all card pages.

$subpath = "/Cards/";
echo(getcwd().$subpath);
$indir = scandir(getcwd().$subpath);

for($i = 0; $i < sizeof($indir); $i++)
{
	$curdir = $subpath.$indir[$i];
	
	echo("<br>");
	echo($curdir);
	if($curdir[0] == '.')
		continue;
	
	//if(!is_dir($curdir))
	//	continue;
	
	echo('<a href="./Splay?subpath='.$curdir.'">'.$curdir.'</a>');
	echo("<br>");
}
?>
	</body>
</html>