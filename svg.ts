export class SVGDrawable {

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