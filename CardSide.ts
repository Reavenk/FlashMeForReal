import { SVGUtils } from "./SVGUtils";

/**
 * Represents an individual card side (i.e., a question side or answer side)
 */
export class CardSide
{
	/** 
	 * The SVG elements in the card.
	 */
    nodes : Array<Element> = new Array<Element>();

	constructor()
	{}
	
	/**
	 * Make a copy of the card contents with an option offset applied, and 
	 * move that coppied content into an XML (SVG) document.
	 * @param xmlDstDoc The destination document to move coppied content into.
	 * @param xmlLayer The layer the destination document to move the content into.
	 * @param r2Ofs The offset to apply.
	 * @returns A list of all the cloned objects.
	 */
	CloneInto(
        xmlDstDoc: XMLDocument, 
        xmlLayer: Element, 
        r2Ofs: Array<number>)
	{
		let retClones: Array<Element> = new Array<Element>();
		for(let i = 0; i < this.nodes.length; ++i)
		{
			let cpy: Element = xmlDstDoc.importNode(this.nodes[i], true);
			SVGUtils.MoveNode(cpy, r2Ofs);
			xmlLayer.appendChild(cpy);
			retClones.push(cpy);
		}
		return retClones;
	}
	
	/**
	 * Move the contents in the side by a 2D offset.
	 * @param r2ofs The offset to move the contents
	 */
	MoveNodes(r2ofs : Array<number>)
	{
		SVGUtils.MoveNodes(this.nodes, r2ofs);
	}
	
	/**
	 * Add SVG elements to the card side.
	 * @param newNodes Add additional nodes to the card's contents.
	 */
	AppendNodes(newNodes : Array<Element>)
	{
		this.nodes.push(...newNodes);
	}
	
	/**
	 * Download a (SVG) URL via AJAX and apply the SVG elements into a CardSide.
	 * @param svgUrl The URL to download.
	 * @param cardTarg The CardSide to move the downloaded elements into.
	 */
	static LoadXMLURLInto(svgUrl: string, cardTarg: CardSide)
	{
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() 
		{
			if (xmlhttp.readyState == XMLHttpRequest.DONE) 
			{   // XMLHttpRequest.DONE == 4
			   if (xmlhttp.status == 200) 
			   {
					//document.getElementById("test").innerHTML = xmlhttp.responseText;
				   
					let parser = new DOMParser();
					let xmlDoc = parser.parseFromString(xmlhttp.responseText, "text/xml");
					cardTarg.AppendNodes(CardSide.ExtractDocumentNodes(xmlDoc));
				}
				else if (xmlhttp.status == 404) 
				{ 
					alert('There was an error 404'); 
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
	
	/**
	 * Create a CardSide from the contents of a (SVG) XML document.
	 * @param xmlDoc The (SVG) XML Document.
	 * @returns The created CardSide.
	 */
	static CreateFromXML(xmlDoc : XMLDocument)
	{
        let cs: CardSide = new CardSide();
		cs.CreateFromNodes(CardSide.ExtractDocumentNodes(xmlDoc));
        return cs;
	}
	
	/**
	 * Set the node contents.
	 * @param newNodes The nodes to set as the card's contents.
	 */
	CreateFromNodes(newNodes : Array<Element>)
	{
		this.nodes = newNodes;
	}
	
	/**
	 * Extract supported (SVG) XML nodes from an (SVG) XML document.
	 * @param xmlDoc The document to scan.
	 * @returns Valid (SVG) XML nodes that are supported by the system.
	 */
	static ExtractDocumentNodes(xmlDoc : XMLDocument) : Array<Element>
	{
		let extraNodes = new Array<Element>();
		let contentLayer : Element|null = xmlDoc.documentElement.children.namedItem("layer1");
		
		if(contentLayer)
		{
			for( let i = 0; i < contentLayer.childElementCount; ++i)
			{
				let childNode = contentLayer.children[i];
					
				// We don't need refPt here, but if we can't get 
				// it here, this is probably a sign that node 
				// type will cause issues when we try to move it later
				let refPt = SVGUtils.GetNodeRefPt(childNode);
				if(!refPt)
				{
					console.log("Skipping possibly problematic node");
					continue;
				}
				
				extraNodes.push(childNode);
			}
		}
		else
		{
			console.log("Error extracting document node. Missing expected Inkscape layer.");
		}

		return extraNodes;
	}

	/**
	 * In a given set of SVG elements, find nodes that should show the card theme, and set it to a specified value.
	 * @param nodes The collection of nodes that may contain the theme node.
	 * @param themeName The value to set the text of the theme.
	 * @returns True if a node was found and set. Else, false.
	 */
	static FindAndSetTheme(nodes : Array<Element>, themeName : string) : boolean
	{
		if(!nodes)
			return false;
		
		let toProc = [...nodes]
		
		while(toProc.length > 0)
		{
			let n : Element | undefined = toProc.pop();
			if(n == undefined)
				continue;

			if(n.id == "theme")
			{
				n.innerHTML = themeName;
				return true;
			}
			toProc.push(...n.children);
		}
		return true;
	}
}