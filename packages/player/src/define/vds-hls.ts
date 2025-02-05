import { safelyDefineCustomElement } from '@vidstack/foundation';

import { HlsElement } from '../providers/hls/HlsElement';

safelyDefineCustomElement('vds-hls', HlsElement);

declare global {
  interface HTMLElementTagNameMap {
    'vds-hls': HlsElement;
  }
}
