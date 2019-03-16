import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'safeDom' })
export class SafeDom implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(style) {
        return this.sanitizer.bypassSecurityTrustHtml(style);
        // return this.sanitizer.bypassSecurityTrustStyle(style);
        // return this.sanitizer.bypassSecurityTrustXxx(style); - see docs
    }
}
