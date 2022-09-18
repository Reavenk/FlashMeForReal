<?php
# Converts a concatenation of multiple SVG files into a multipage PDF
#
# It does this via Inkscape involving several steps:
# 1. Figure out how many SVG files are in the payload
# 2. Extract those files and save them as temporary files, but remember the order.
# 3. Run command line tool to merge the SVGS into a pdf.
# 4. Load PDF file binary and send back as payload.

# The request payload format is a long string, with the SVG files and some other
# data combined, but separated with a pipe (|) character.
# 
# <num_files>|<size_file_0>|<file_0>|...|<size_file_n>|<file_n>
#
# When sending payload, care must be taken to make sure the file sizes are correct,
# as this value should reflect the NUMBER OF BYTES AND NOT THE CHARACTER COUNT as
# character length of a string will probably be invalid for extraction when we take
# into account Unicode support.

error_reporting(E_ERROR | E_PARSE);
chdir(__DIR__);
$cleanup = false;

##################################################
#
#		BREAK PAYLOAD INTO MULTIPLE SVG FILES
#
##################################################
$svgDocs = array();
$json = file_get_contents('php://input');
$endFileCt = strpos($json, "|");
$fileCt = intval(substr($json, 0, $endFileCt));

// file_put_contents("tmp/preview.txt", $json);

$fileIt = $endFileCt + 1;
for ($x = 0; $x < $fileCt; $x++) 
{
	$endReadAmt = strpos($json, "|", $fileIt);
	$curSz = intval(substr($json, $fileIt, $endReadAmt - $fileIt));
	$fileIt = $endReadAmt + 1;
	
	$svg = substr($json, $fileIt, $curSz);
	array_push($svgDocs, $svg);
	$fileIt += $curSz;
}

##################################################
#
#		GENERATE PDFS
#
##################################################
$pdfPath = "\"C:/Program Files/Inkscape/bin/inkscape.exe\"";

# The intermediary PDFs
$pdfFiles = array();

if(!is_dir("tmp"))
	mkdir("tmp");

for($x = 0; $x < count($svgDocs); ++$x)
{
	# Use a headless Inkscape to convert the SVG
	# files into PDFs
	
	# Save the SVG to file so inkscape can access it.
	$uidFile = uniqid("tmp/tmp_").".svg";
	file_put_contents($uidFile, $svgDocs[$x]);
	
	$uidPDF = $uidFile.".pdf";
	# https://graphicdesign.stackexchange.com/questions/5880/how-to-export-an-inkscape-svg-file-to-a-pdf-and-maintain-the-integrity-of-the-im
	$pdfExportCmd = $pdfPath." --without-gui --actions=\"export-area-page; export-filename:".$uidPDF."; export-do\" ".$uidFile;
	
	exec($pdfExportCmd);
	array_push($pdfFiles, $uidPDF);
	
	# Clean up SVG, no longer needer after we have PDF
	if($cleanup)
		unlink($uidFile);
}

##################################################
#
#		GENERATE COMPILED PDF
#
##################################################

# Final PDF name
$output_name = $uidFile = uniqid("tmp/out_").".pdf";

$compilePdfCmd = "pdftk ";
for($x = 0; $x < count($pdfFiles); ++$x)
{
	$compilePdfCmd = $compilePdfCmd.$pdfFiles[$x]." ";
}
$compilePdfCmd=$compilePdfCmd."output ".$output_name;
exec($compilePdfCmd);

##################################################
#
#		SUBMIT FILE
#
##################################################

# https://stackoverflow.com/questions/6175533/how-to-return-a-file-in-php
header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
header("Cache-Control: public"); // needed for internet explorer
header("Content-Type: application/octet-stream");
header("Content-Transfer-Encoding: Binary");
header("Content-Length:".filesize($output_name));
header("Content-Disposition: attachment; filename=FlashCards.pdf");
readfile($output_name);

##################################################
#
#		CLEANUP INTERMEDIARY FILES
#
##################################################

for ($x = 0; $x < count($pdfFiles); ++$x) 
{
	if($cleanup)
		unlink($pdfFiles[$x]);
}

if($cleanup)
	unlink($output_name);

die();
?>