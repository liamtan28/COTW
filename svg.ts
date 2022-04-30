export class SVGPathDrawable {

    private path: string;
    private SVG_NAMESPACE: string;
    private node: SVGPathElement;

    public constructor(namespace: string, path: string) {
        this.SVG_NAMESPACE = namespace;
        this.path = path;
        this.node = this.createSVGPath();
    }

    private createSVGPath(): SVGPathElement {
        return document.createElementNS(
            this.SVG_NAMESPACE,
            "path",
        ) as unknown as SVGPathElement;
    }

    public setAttribute(name: string, value): void {
        this.node.setAttribute(name, value);
    }

    public clear(clearFromSVG: SVGElement): void {
        clearFromSVG.removeChild(this.node);
    }

    public drawTo(
        drawToSVG: SVGElement,
        fill: string,
        stroke: string,
        strokeWidth: string
    ): void {

        this.node.setAttribute("d", this.path);

        this.node.style.fill = fill;
        this.node.style.stroke = stroke;
        this.node.style.strokeWidth = strokeWidth;
        drawToSVG.appendChild(this.node);
    }

}

export class SVGTextDrawable {
    private text: string;
    private x: number;
    private y: number;
    private SVG_NAMESPACE: string;
    private node: SVGTextElement;

    public constructor(namespace: string, text: string, x: number, y: number) {
        this.SVG_NAMESPACE = namespace;
        this.text = text;
        this.x = x;
        this.y = y;
        this.node = this.createSVGText();
    }

    private createSVGText(): SVGTextElement {
        return document.createElementNS(
            this.SVG_NAMESPACE,
            "text",
        ) as unknown as SVGTextElement;
    }

    public setAttribute(name: string, value): void {
        this.node.setAttribute(name, value);
    }

    public clear(clearFromSVG: SVGElement): void {
        clearFromSVG.removeChild(this.node);
    }

    public updateText(text: string): void {
        this.text = text;
    }

    public drawTo(
        drawToSVG: SVGElement,
        fill: string,
    ): void {

        this.node.setAttribute("x", String(this.x));
        this.node.setAttribute("y", String(this.y));

        this.node.style.fill = fill;
        this.node.innerHTML = `${this.text}`;
        drawToSVG.appendChild(this.node);
    }
}