<?php 
?>

<html>
	<head>
		<script src="SVGUtils.js" ></script>
		<script src="CardSegTemplate.js" ></script>
		<script src="PageSettings.js" ></script>
		<script src="PageSet.js" ></script>
		<script src="CardSide.js" ></script>
		<script src="DOMLoc.js" ></script>
		<title></title>
	</head>
	<body>
	<div id="card_location"></div>
<script>
const AppState = {
	Init: "initing",
	Loading: "loading",
	Parsing: "parsing",
	Idling: "idling",
	Quizzing: "quizzing"
}

<?php
$sp = $_GET["subpath"];
//echo(getcwd()."\\".$sp);
echo("let subpath=\"$sp\";");
?>
let dirpath="listsvgs?subpath="+subpath+"\"";
console.log(subpath);
console.log(dirpath);

let templateBlank 		= new DOMLoc();
let templateBlankLined 	= new DOMLoc();
DOMLoc.LoadXMLURLInto("BlankDocument.svg", templateBlank);
DOMLoc.LoadXMLURLInto("BlankDocument_Lined.svg", templateBlankLined);

let cardQFace = new CardSide();
let cardAFace = new CardSide();
let cardTheme = new CardSide();
CardSide.LoadXMLURLInto("Card_QFace.svg", cardQFace);
CardSide.LoadXMLURLInto("Card_AFace.svg", cardAFace);
CardSide.LoadXMLURLInto("Card_Theme.svg", cardTheme);

let carddlCt = 0;
let carddl = 0;

function GetDirectory()
{
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = 
		function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				//console.log(this.responseText);
				let parsedDirectory = JSON.parse(this.responseText);
				carddlCt = parsedDirectory.length;
				for(const cardInfo of parsedDirectory)
				{
					let file = cardInfo["filename"];
					let svgPath = "getsvg.php?subpath="+subpath+"/"+file;
					console.log(svgPath);
					LoadCardInfo(svgPath);
				}
			}
		};
	xhttp.open("GET", dirpath, true);
	xhttp.send();
}

let cardTemplates=[];
function LoadCardInfo(path)
{
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = 
		function() 
		{
			if (this.readyState == 4) 
			{
				++carddl;
				
				if(this.status == 200)
				{
					console.log(this.responseText);
				}
				else
				{
					console.log("Missed loading expected card" + path);
				}
				if(carddl == carddlCt)
				{
					alert("yo");
				}
			}
			
			
		};
	xhttp.open("GET", path, true);
	xhttp.send();
}

GetDirectory();

</script>

	</body>
</html>