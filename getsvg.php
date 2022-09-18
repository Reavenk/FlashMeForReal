<?php

function endsWith($haystack, $needle) {
    return substr_compare($haystack, $needle, -strlen($needle)) === 0;
}

$sp = $_GET["subpath"];
if(!endsWith($sp, ".svg"))
	return;

$fileContents = file_get_contents($sp);
echo($fileContents);
?>