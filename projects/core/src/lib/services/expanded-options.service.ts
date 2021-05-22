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
    const uniqueButtonEl: Element = this.lightbox.getElementsByClassName('pswp__button--unique')[0];
    if (!hasUniqueButtonEl || !uniqueButtonOptions.length || !uniqueButtonEl) {
      return;
    }

    const buttons = [];
    uniqueButtonOptions.forEach((option) => {
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
      this.renderer.listen(button, 'click', () => {
        return option?.eventFn && option?.eventFn(null);
      });
      this.renderer.appendChild(uniqueButtonEl, button);
      buttons.push(button);
    });

    // onDestroy
    this.gallery.listen('destroy', () => {
      buttons.forEach((button) => this.renderer.removeChild(uniqueButtonEl, button));
    });
  }
  private camel2Kebab(camel: string): string {
    return camel
      .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      .replace(/^-+/, () => '');
  }
}
