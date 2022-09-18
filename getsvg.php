<?php

# Allows pages to get SVG files from an API call instead of by referencing
# the resource directly. 
#
# Type: GET
# Params:
# 	- subpath
# 		File to send as response.
#
# Response: The requested SVG file.

function endsWith($haystack, $needle) {
    return substr_compare($haystack, $needle, -strlen($needle)) === 0;
}

$sp = $_GET["subpath"];
if(!endsWith($sp, ".svg"))
	return;

$fileContents = file_get_contents($sp);
echo($fileContents);
?>