import {
  Injectable,
  Renderer2,
  RendererFactory2,
} from '@angular/core';

import { ExpandedGalleryOptions, UniqueButtonOption } from '../interfaces/photoswipe';

import { LightboxService } from './lightbox.service';

@Injectable({ providedIn: 'root' })
export class ExpandedOptionsService {
  private renderer: Renderer2;
  private gallery: any;
  private lightbox: HTMLElement;

  constructor(
    private _renderer: RendererFactory2,
    private lightboxService: LightboxService
  ) {
    this.renderer = _renderer.createRenderer(null, null);
  }

  initExpandedOptions(_gallery: any, options: ExpandedGalleryOptions): void {
    this.gallery = _gallery;
    this.lightbox = this.lightboxService.getLightboxElement();

    this.initUniqueButtonEl(options?.uniqueButtonEl, options?.uniqueButtonOptions);
  }

  private initUniqueButtonEl(hasUniqueButtonEl: boolean, uniqueButtonOptions: UniqueButtonOption[])  {
    if (hasUniqueButtonEl && uniqueButtonOptions.length) {
      const uniqueButtonElHTML: Element = this.lightbox.getElementsByClassName('pswp__button--unique')[0];
      let classes: string[] = [];
      Array.from((new Array(uniqueButtonElHTML.children.length)).keys())
        .forEach((i: number) =>
          uniqueButtonElHTML.children[i].classList.forEach((className: string) => classes.push(className)));
      classes = new Array(...(new Set(classes)));

      uniqueButtonOptions.forEach((option) => {
        if (classes.includes(`pswp__button--${this.camel2Kebab(option.eventName)}`) || (!option?.text && !option?.image)) {
          return;
        }
        const button = this.renderer.createElement('button');
        this.renderer.addClass(button, 'pswp__button');
        this.renderer.addClass(button, `pswp__button--${this.camel2Kebab(option.eventName)}`);
        if (option?.image) {
          this.renderer.setStyle(button, 'background-image', `url(${option.image}`);
        } else if (option?.text) {
          this.renderer.addClass(button, 'pswp__button--no-image');
          this.renderer.appendChild(button, this.renderer.createText(option.text));
        }
        this.renderer.setAttribute(button, 'title', option.title);
        this.renderer.listen(button, 'click', option?.eventFn || (() => {}));
        this.renderer.appendChild(uniqueButtonElHTML, button);
      });
    }
  }
  private camel2Kebab(camel: string): string {
    return camel
      .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      .replace(/^-+/, () => '');
  }
}
