import { Render } from './Render';
import { Helper } from '../Helper';
/**
 * Class responsible for rendering the HTML book
 */
export class HTMLRender extends Render {
    /**
     * @constructor
     *
     * @param {FlipFlow} app - FlipFlow object
     * @param {FlipSetting} setting - Configuration object
     * @param {HTMLElement} element - Parent HTML Element
     */
    constructor(app, setting, element) {
        super(app, setting);
        this.outerShadow = null;
        this.innerShadow = null;
        this.hardShadow = null;
        this.hardInnerShadow = null;
        this.element = element;
        this.createShadows();
    }
    createShadows() {
        this.element.insertAdjacentHTML(
            'beforeend',
            `<div class="stf__outerShadow"></div>
             <div class="stf__innerShadow"></div>
             <div class="stf__hardShadow"></div>
             <div class="stf__hardInnerShadow"></div>`,
        );
        this.outerShadow = this.element.querySelector('.stf__outerShadow');
        this.innerShadow = this.element.querySelector('.stf__innerShadow');
        this.hardShadow = this.element.querySelector('.stf__hardShadow');
        this.hardInnerShadow = this.element.querySelector('.stf__hardInnerShadow');
    }
    clearShadow() {
        super.clearShadow();
        this.outerShadow.style.cssText = 'display: none';
        this.innerShadow.style.cssText = 'display: none';
        this.hardShadow.style.cssText = 'display: none';
        this.hardInnerShadow.style.cssText = 'display: none';
    }
    reload() {
        const testShadow = this.element.querySelector('.stf__outerShadow');
        if (!testShadow) {
            this.createShadows();
        }
    }
    /**
     * Draw inner shadow to the hard page
     */
    drawHardInnerShadow() {
        const rect = this.getRect();
        const progress =
            this.shadow.progress > 100 ? 200 - this.shadow.progress : this.shadow.progress;
        let innerShadowSize = ((100 - progress) * (2.5 * rect.pageWidth)) / 100 + 20;
        if (innerShadowSize > rect.pageWidth) innerShadowSize = rect.pageWidth;
        let newStyle = `
            display: block;
            z-index: ${(this.getSettings().startZIndex + 5).toString(10)};
            width: ${innerShadowSize}px;
            height: ${rect.height}px;
            background: linear-gradient(to right,
                rgba(0, 0, 0, ${(this.shadow.opacity * progress) / 100}) 5%,
                rgba(0, 0, 0, 0) 100%);
            left: ${rect.left + rect.width / 2}px;
            transform-origin: 0 0;
        `;
        newStyle +=
            (this.getDirection() === 0 /* FlipDirection.FORWARD */ && this.shadow.progress > 100) ||
            (this.getDirection() === 1 /* FlipDirection.BACK */ && this.shadow.progress <= 100)
                ? `transform: translate3d(0, 0, 0);`
                : `transform: translate3d(0, 0, 0) rotateY(180deg);`;
        this.hardInnerShadow.style.cssText = newStyle;
    }
    /**
     * Draw outer shadow to the hard page
     */
    drawHardOuterShadow() {
        const rect = this.getRect();
        const progress =
            this.shadow.progress > 100 ? 200 - this.shadow.progress : this.shadow.progress;
        let shadowSize = ((100 - progress) * (2.5 * rect.pageWidth)) / 100 + 20;
        if (shadowSize > rect.pageWidth) shadowSize = rect.pageWidth;
        let newStyle = `
            display: block;
            z-index: ${(this.getSettings().startZIndex + 4).toString(10)};
            width: ${shadowSize}px;
            height: ${rect.height}px;
            background: linear-gradient(to left, rgba(0, 0, 0, ${
                this.shadow.opacity
            }) 5%, rgba(0, 0, 0, 0) 100%);
            left: ${rect.left + rect.width / 2}px;
            transform-origin: 0 0;
        `;
        newStyle +=
            (this.getDirection() === 0 /* FlipDirection.FORWARD */ && this.shadow.progress > 100) ||
            (this.getDirection() === 1 /* FlipDirection.BACK */ && this.shadow.progress <= 100)
                ? `transform: translate3d(0, 0, 0) rotateY(180deg);`
                : `transform: translate3d(0, 0, 0);`;
        this.hardShadow.style.cssText = newStyle;
    }
    /**
     * Draw inner shadow to the soft page
     */
    drawInnerShadow() {
        const rect = this.getRect();
        const innerShadowSize = (this.shadow.width * 3) / 4;
        const shadowTranslate =
            this.getDirection() === 0 /* FlipDirection.FORWARD */ ? innerShadowSize : 0;
        const shadowDirection =
            this.getDirection() === 0 /* FlipDirection.FORWARD */ ? 'to left' : 'to right';
        const shadowPos = this.convertToGlobal(this.shadow.pos);
        const angle = this.shadow.angle + (3 * Math.PI) / 2;
        const clip = [
            this.pageRect.topLeft,
            this.pageRect.topRight,
            this.pageRect.bottomRight,
            this.pageRect.bottomLeft,
        ];
        let polygon = 'polygon( ';
        for (const p of clip) {
            let g =
                this.getDirection() === 1 /* FlipDirection.BACK */
                    ? {
                          x: -p.x + this.shadow.pos.x,
                          y: p.y - this.shadow.pos.y,
                      }
                    : {
                          x: p.x - this.shadow.pos.x,
                          y: p.y - this.shadow.pos.y,
                      };
            g = Helper.GetRotatedPoint(g, { x: shadowTranslate, y: 100 }, angle);
            polygon += g.x + 'px ' + g.y + 'px, ';
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        const newStyle = `
            display: block;
            z-index: ${(this.getSettings().startZIndex + 10).toString(10)};
            width: ${innerShadowSize}px;
            height: ${rect.height * 2}px;
            background: linear-gradient(${shadowDirection},
                rgba(0, 0, 0, ${this.shadow.opacity}) 5%,
                rgba(0, 0, 0, 0.05) 15%,
                rgba(0, 0, 0, ${this.shadow.opacity}) 35%,
                rgba(0, 0, 0, 0) 100%);
            transform-origin: ${shadowTranslate}px 100px;
            transform: translate3d(${shadowPos.x - shadowTranslate}px, ${
                shadowPos.y - 100
            }px, 0) rotate(${angle}rad);
            clip-path: ${polygon};
            -webkit-clip-path: ${polygon};
        `;
        this.innerShadow.style.cssText = newStyle;
    }
    /**
     * Draw outer shadow to the soft page
     */
    drawOuterShadow() {
        const rect = this.getRect();
        const shadowPos = this.convertToGlobal({ x: this.shadow.pos.x, y: this.shadow.pos.y });
        const angle = this.shadow.angle + (3 * Math.PI) / 2;
        const shadowTranslate =
            this.getDirection() === 1 /* FlipDirection.BACK */ ? this.shadow.width : 0;
        const shadowDirection =
            this.getDirection() === 0 /* FlipDirection.FORWARD */ ? 'to right' : 'to left';
        const clip = [
            { x: 0, y: 0 },
            { x: rect.pageWidth, y: 0 },
            { x: rect.pageWidth, y: rect.height },
            { x: 0, y: rect.height },
        ];
        let polygon = 'polygon( ';
        for (const p of clip) {
            if (p !== null) {
                let g =
                    this.getDirection() === 1 /* FlipDirection.BACK */
                        ? {
                              x: -p.x + this.shadow.pos.x,
                              y: p.y - this.shadow.pos.y,
                          }
                        : {
                              x: p.x - this.shadow.pos.x,
                              y: p.y - this.shadow.pos.y,
                          };
                g = Helper.GetRotatedPoint(g, { x: shadowTranslate, y: 100 }, angle);
                polygon += g.x + 'px ' + g.y + 'px, ';
            }
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        const newStyle = `
            display: block;
            z-index: ${(this.getSettings().startZIndex + 10).toString(10)};
            width: ${this.shadow.width}px;
            height: ${rect.height * 2}px;
            background: linear-gradient(${shadowDirection}, rgba(0, 0, 0, ${
                this.shadow.opacity
            }), rgba(0, 0, 0, 0));
            transform-origin: ${shadowTranslate}px 100px;
            transform: translate3d(${shadowPos.x - shadowTranslate}px, ${
                shadowPos.y - 100
            }px, 0) rotate(${angle}rad);
            clip-path: ${polygon};
            -webkit-clip-path: ${polygon};
        `;
        this.outerShadow.style.cssText = newStyle;
    }
    /**
     * Draw left static page
     */
    drawLeftPage() {
        if (this.orientation === 'portrait' /* Orientation.PORTRAIT */ || this.leftPage === null)
            return;
        if (
            this.direction === 1 /* FlipDirection.BACK */ &&
            this.flippingPage !== null &&
            this.flippingPage.getDrawingDensity() === 'hard' /* PageDensity.HARD */
        ) {
            this.leftPage.getElement().style.zIndex = (this.getSettings().startZIndex + 5).toString(
                10,
            );
            this.leftPage.setHardDrawingAngle(180 + this.flippingPage.getHardAngle());
            this.leftPage.draw(this.flippingPage.getDrawingDensity());
        } else {
            this.leftPage.simpleDraw(0 /* PageOrientation.LEFT */);
        }
    }
    /**
     * Draw right static page
     */
    drawRightPage() {
        if (this.rightPage === null) return;
        if (
            this.direction === 0 /* FlipDirection.FORWARD */ &&
            this.flippingPage !== null &&
            this.flippingPage.getDrawingDensity() === 'hard' /* PageDensity.HARD */
        ) {
            this.rightPage.getElement().style.zIndex = (
                this.getSettings().startZIndex + 5
            ).toString(10);
            this.rightPage.setHardDrawingAngle(180 + this.flippingPage.getHardAngle());
            this.rightPage.draw(this.flippingPage.getDrawingDensity());
        } else {
            this.rightPage.simpleDraw(1 /* PageOrientation.RIGHT */);
        }
    }
    /**
     * Draw the next page at the time of flipping
     */
    drawBottomPage() {
        if (this.bottomPage === null) return;
        const tempDensity =
            this.flippingPage != null ? this.flippingPage.getDrawingDensity() : null;
        if (
            !(
                (
                    this.orientation === 'portrait' /* Orientation.PORTRAIT */ &&
                    this.direction === 1
                ) /* FlipDirection.BACK */
            )
        ) {
            this.bottomPage.getElement().style.zIndex = (
                this.getSettings().startZIndex + 3
            ).toString(10);
            this.bottomPage.draw(tempDensity);
        }
    }
    drawFrame() {
        this.clear();
        this.drawLeftPage();
        this.drawRightPage();
        this.drawBottomPage();
        if (this.flippingPage != null) {
            this.flippingPage.getElement().style.zIndex = (
                this.getSettings().startZIndex + 5
            ).toString(10);
            this.flippingPage.draw();
        }
        if (this.shadow != null && this.flippingPage !== null) {
            if (this.flippingPage.getDrawingDensity() === 'soft' /* PageDensity.SOFT */) {
                this.drawOuterShadow();
                this.drawInnerShadow();
            } else {
                this.drawHardOuterShadow();
                this.drawHardInnerShadow();
            }
        }
    }
    clear() {
        for (const page of this.app.getPageCollection().getPages()) {
            if (
                page !== this.leftPage &&
                page !== this.rightPage &&
                page !== this.flippingPage &&
                page !== this.bottomPage
            ) {
                page.getElement().style.cssText = 'display: none';
            }
            if (page.getTemporaryCopy() !== this.flippingPage) {
                page.hideTemporaryCopy();
            }
        }
    }
    update() {
        super.update();
        if (this.rightPage !== null) {
            this.rightPage.setOrientation(1 /* PageOrientation.RIGHT */);
        }
        if (this.leftPage !== null) {
            this.leftPage.setOrientation(0 /* PageOrientation.LEFT */);
        }
    }
}
