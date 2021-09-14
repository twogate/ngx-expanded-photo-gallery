import {
  Directive,
  HostListener,
  Input,
  ElementRef,
  AfterContentInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { PhotoGalleryGroupDirective } from './photo-gallery-group.directive';

@Directive({
  selector: '[photoGallery]',
})
export class PhotoGalleryDirective implements AfterContentInit, OnChanges, OnDestroy {
  @Input('photoGallery') imageUrl: string;
  @Input() photoGalleryTrackBy: string;
  @Input() photoGalleryCaption: string;
  @Input() photoGalleryItem: any;
  private id: string;
  private initialized = false;

  private get getGalleryItem() {
    return {
      id: this.id,
      element: this.el.nativeElement as HTMLElement,
      imageUrl: this.imageUrl,
      caption: this.photoGalleryCaption,
      data: this.photoGalleryItem,
    };
  }

  constructor(private el: ElementRef, private photoGalleryGroup: PhotoGalleryGroupDirective) {}

  ngAfterContentInit(): void {
    this.id = this.photoGalleryTrackBy || this.imageUrl;
    this.photoGalleryGroup.registerGalleryItem(this.getGalleryItem);
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      this.photoGalleryGroup.updateGalleryItem(this.getGalleryItem);
    }
  }

  ngOnDestroy(): void {
    this.photoGalleryGroup.unregisterGalleryItem(this.id);
  }

  @HostListener('click')
  async openPhotoSwipe(): Promise<void> {
    await this.photoGalleryGroup.openPhotoSwipe(this.id);
  }
}
