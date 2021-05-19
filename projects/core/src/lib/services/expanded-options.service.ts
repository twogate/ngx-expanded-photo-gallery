import {
  ApplicationRef,
  ComponentFactoryResolver, ComponentRef,
  Injectable,
  Injector,
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
    private applicationRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private lightboxService: LightboxService
  ) {
    this.renderer = _renderer.createRenderer(null, null);
  }

  initExpandedOptions(_gallery: any, options: ExpandedGalleryOptions): void {
    this.gallery = _gallery;
    this.lightbox = this.lightboxService.getLightboxElement();

    this.initUniqueButtonEl(options?.uniqueButtonEl, options?.uniqueButtonOptions);
    this.initCustomUi(options?.customUiComponent, options?.customUiProp);
  }

  private initUniqueButtonEl(hasUniqueButtonEl: boolean, uniqueButtonOptions: UniqueButtonOption[])  {
    const uniqueButtonEl: Element = this.lightbox.getElementsByClassName('pswp__button--unique')[0];
    if (!hasUniqueButtonEl || !uniqueButtonOptions.length || !uniqueButtonEl) {
      return;
    }

    let classes: string[] = [];
    Array.from((new Array(uniqueButtonEl.children.length)).keys())
      .forEach((i: number) =>
        uniqueButtonEl.children[i].classList.forEach((className: string) => classes.push(className)));
    classes = new Array(...(new Set(classes)));

    const buttons = [];
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
      this.renderer.listen(button, 'click', () => {
        return option?.eventFn(this.gallery, this.lightbox);
      });
      this.renderer.appendChild(uniqueButtonEl, button);
      buttons.push(button);
    });

    // on destroy
    this.gallery.listen('destroy', () => {
      buttons.forEach((button) => this.renderer.removeChild(uniqueButtonEl, button));
      this.renderer.setAttribute(uniqueButtonEl, 'class', 'pswp__button--unique');
    });
  }
  private camel2Kebab(camel: string): string {
    return camel
      .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      .replace(/^-+/, () => '');
  }

  private initCustomUi(customUiComponent: any, customUiProp: any) {
    const customUiEl: Element = this.lightbox.getElementsByClassName('pswp__caption__center--custom')[0];
    if (!customUiComponent || !customUiEl) {
      return;
    }

    let hasCustomUi = false;
    Array.from((new Array(customUiEl.children.length)).keys())
      .forEach((i: number) =>
          hasCustomUi = hasCustomUi || customUiEl.children[i].classList.contains('pswp__custom-ui')
       );
    if (hasCustomUi) {
      return;
    }

    const customUiComponentRef: ComponentRef<any> = this.componentFactoryResolver
      .resolveComponentFactory(customUiComponent)
      .create(this.injector);
    if (customUiProp) {
      customUiComponentRef.instance.someProp = customUiProp;
    }
    customUiComponentRef.instance.pswp = this.gallery;
    customUiComponentRef.instance.lightbox = this.lightbox;
    this.applicationRef.attachView(customUiComponentRef.hostView);
    this.renderer.addClass(customUiComponentRef.location.nativeElement, 'pswp__custom-ui');
    this.renderer.appendChild(customUiEl, customUiComponentRef.location.nativeElement);

    this.gallery.invalidateCurrItems();
    this.gallery.updateSize(true);

    const captionCenterEls: HTMLCollectionOf<Element> = this.lightbox.getElementsByClassName('pswp__caption__center');
    Array.from((new Array(captionCenterEls.length)).keys())
      .forEach((i: number) => this.renderer.setStyle(captionCenterEls[i], 'display', 'none'));
    const captionEl = this.lightbox.getElementsByClassName('pswp__caption pswp__caption--empty')[0];
    this.renderer.addClass(captionEl, 'pswp__caption--has-custom-ui');
    this.renderer.removeClass(captionEl, 'pswp__caption--empty');

    // on destroy
    this.gallery.listen('destroy', () => {
      this.renderer.removeChild(customUiEl, customUiComponentRef.location.nativeElement);
      this.renderer.setAttribute(customUiEl, 'class', 'pswp__caption__center--custom');
    });
  }
}
