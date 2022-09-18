/** 
 * A collection of parameters that defines the property of pages involves.
 *
 * Primarily:
 *	- The dimensions of the parts of the SVG dimensions that represent a single question.
 * 	- The dimensions of the PDF pages the questions will be compiled to.
 */ 
export class PageSettings 
{
	/** 
	 * The width of a flashcard. 
	 * Uses SVG's default millimeter units.
	 */ 
	cardWidth: number;
	
	/** 
	* The height of a flashcard. 
	* Uses SVG's default millimeter units.
	*/ 
	cardHeight: number;

	/** 
	 * The width of a rendered flashcard collection page. 
	 * Uses SVG's default millimeter units.
	 */ 
	pageWidth: number;
	
	/** 
	 * The height of a rendered flashcard collection page.
	 * Uses SVG's default millimeter units.
	 */ 
	pageHeight: number;

	/** 
	 * The horizontal offset on the rendered page where the origin of the content starts.
	 * This value is from the top left; positive values go right.
	 */ 
	offsetX: number;
	
	/** 
	 * The vertical offset on the rendered page where teh origin of the content starts.
	 * This value is from the top left; positive values go down.
	 */ 
	offsetY: number;

	// TODO: We should probably just have a 2D vector class
	constructor(
		cardDim : Array<number>, 
		pageDim : Array<number>, 
		offsetDim: Array<number>) 
	{
		this.cardWidth = cardDim[0];
		this.cardHeight = cardDim[1];

		this.pageWidth = pageDim[0];
		this.pageHeight = pageDim[1];

		this.offsetX = offsetDim[0];
		this.offsetY = offsetDim[1];
	}

	/** 
	 * The dimensions of the grid of cards on a single page.
	 */ 
	ExpectedTileDim() : [number, number]
	{
		const epsBuffer : number = 0.001; // Guard against floating point errors

		let x: number = (this.pageWidth - 2 * this.offsetX) / this.cardWidth;
		let y: number = (this.pageHeight - 2 * this.offsetY) / this.cardHeight;

		return [Math.floor(x + epsBuffer), Math.floor(y + epsBuffer)];
	}

	/** 
	 * The target document sizes, where the cards will be of business card size, and 
	 * the final page will be letter size (8.5" x 11" cardstock). See The offsets are
	 * centering a 2x5 grid of business cards on a letter size, such as [this](https://www.amazon.com/Hamilco-Blank-Business-Cards-Stock/dp/B07L8LB741/).
	 */ 
	static defaultLetter =
		new PageSettings(
			[88.9, 50.8],
			[215.9, 279.4],
			[19.05, 12.7]);
}