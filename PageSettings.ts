export class PageSettings 
{
	cardWidth: number;
	cardHeight: number;

	pageWidth: number;
	pageHeight: number;

	offsetX: number;
	offsetY: number;

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

	ExpectedTileDim() 
	{
		const epsBuffer : number = 0.001; // Guard against floating point errors

		let x: number = (this.pageWidth - 2 * this.offsetX) / this.cardWidth;
		let y: number = (this.pageHeight - 2 * this.offsetY) / this.cardHeight;

		return [Math.floor(x + epsBuffer), Math.floor(y + epsBuffer)];
	}

	static defaultLetter =
		new PageSettings(
			[88.9, 50.8],
			[215.9, 279.4],
			[19.05, 12.7]);
}