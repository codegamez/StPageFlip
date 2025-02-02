import { Page } from './Page';
/**
 * Class representing a book page as an image on Canvas
 */
export class ImagePage extends Page {
    constructor(render, href, density) {
        super(render, density);
        this.image = null;
        this.isLoad = false;
        this.loadingAngle = 0;
        this.image = new Image();
        this.image.src = href;
    }
    draw(tempDensity) {
        const ctx = this.render.getContext();
        const pagePos = this.render.convertToGlobal(this.state.position);
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().height;
        ctx.save();
        ctx.translate(pagePos.x, pagePos.y);
        ctx.beginPath();
        for (let p of this.state.area) {
            if (p !== null) {
                p = this.render.convertToGlobal(p);
                ctx.lineTo(p.x - pagePos.x, p.y - pagePos.y);
            }
        }
        ctx.rotate(this.state.angle);
        ctx.clip();
        if (!this.isLoad) {
            this.drawLoader(ctx, { x: 0, y: 0 }, pageWidth, pageHeight);
        }
        else {
            ctx.drawImage(this.image, 0, 0, pageWidth, pageHeight);
        }
        ctx.restore();
    }
    simpleDraw(orient) {
        const rect = this.render.getRect();
        const ctx = this.render.getContext();
        const pageWidth = rect.pageWidth;
        const pageHeight = rect.height;
        const x = orient === 1 /* PageOrientation.RIGHT */ ? rect.left + rect.pageWidth : rect.left;
        const y = rect.top;
        if (!this.isLoad) {
            this.drawLoader(ctx, { x, y }, pageWidth, pageHeight);
        }
        else {
            ctx.drawImage(this.image, x, y, pageWidth, pageHeight);
        }
    }
    drawLoader(ctx, shiftPos, pageWidth, pageHeight) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(200, 200, 200)';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 1;
        ctx.rect(shiftPos.x + 1, shiftPos.y + 1, pageWidth - 1, pageHeight - 1);
        ctx.stroke();
        ctx.fill();
        const middlePoint = {
            x: shiftPos.x + pageWidth / 2,
            y: shiftPos.y + pageHeight / 2,
        };
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.arc(middlePoint.x, middlePoint.y, 20, this.loadingAngle, (3 * Math.PI) / 2 + this.loadingAngle);
        ctx.stroke();
        ctx.closePath();
        this.loadingAngle += 0.07;
        if (this.loadingAngle >= 2 * Math.PI) {
            this.loadingAngle = 0;
        }
    }
    load() {
        if (!this.isLoad)
            this.image.onload = () => {
                this.isLoad = true;
            };
    }
    newTemporaryCopy() {
        return this;
    }
    getTemporaryCopy() {
        return this;
    }
    hideTemporaryCopy() {
        return;
    }
}
