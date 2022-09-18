import { CardSide } from "./CardSide";

/**
 * An asyncronous web request to download and store and XML document.
 *
 * (For the use of CardMaker, it's most likely going to be an SVG file.)
 */
export class DOMLoc
{

	/**
	 * The XML document that was download and processed.
	 */	
	root : null | Document = null;

	constructor()
	{}
	
	static LoadXMLURLInto(svgUrl : string, DOMDst: DOMLoc)
	{
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() 
		{
			if (xmlhttp.readyState == XMLHttpRequest.DONE) 
			{   // XMLHttpRequest.DONE == 4
				if (xmlhttp.status == 200) 
				{
					let parser : DOMParser = new DOMParser();
					DOMDst.root = parser.parseFromString(xmlhttp.responseText, "text/xml");
				}
				else if (xmlhttp.status == 400) 
				{ 
					alert('There was an error 400'); 
				}
				else  
				{ 
					alert('something else other than 200 was returned'); 
				}
			}
		};

		xmlhttp.open("GET", svgUrl, true);
		xmlhttp.send();
	}
	
	CloneNode() : Document
	{
		if(this.root)
			return this.root.cloneNode(true) as Document;

		throw new Error("Attempting to clone a DOMLoc resulted in empty return.");
	}
}