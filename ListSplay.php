<html>
	<head>
		<title></title>
	</head>
	<body>
<?php
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