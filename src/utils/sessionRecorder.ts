/**
 * Session Recorder - Chrome DevTools Recorder Compatible
 *
 * Records user interactions in Chrome DevTools Recorder JSON format
 * Can be imported and replayed in Chrome DevTools > Recorder panel
 */

export interface RecordedStep {
  type: 'click' | 'change' | 'keyDown' | 'keyUp' | 'navigate' | 'scroll' | 'waitForElement';
  target?: string;
  selectors?: string[][];
  offsetX?: number;
  offsetY?: number;
  value?: string;
  key?: string;
  url?: string;
  frame?: number[];
  assertedEvents?: Array<{
    type: string;
    title?: string;
    url?: string;
  }>;
  timeout?: number;
}

export interface RecordingSession {
  title: string;
  steps: RecordedStep[];
  timeout: number;
  metadata: {
    bugName: string;
    testerName: string;
    startTime: string;
    endTime?: string;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

class SessionRecorder {
  private recording = false;
  private steps: RecordedStep[] = [];
  private startTime: string = '';
  private metadata: RecordingSession['metadata'] | null = null;

  /**
   * Start recording user interactions
   */
  startRecording(bugName: string, testerName: string) {
    this.recording = true;
    this.steps = [];
    this.startTime = new Date().toISOString();

    this.metadata = {
      bugName,
      testerName,
      startTime: this.startTime,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    // Record viewport (like Chrome Recorder does)
    this.steps.push({
      type: 'setViewport' as any,
      width: window.innerWidth,
      height: window.innerHeight,
      deviceScaleFactor: window.devicePixelRatio || 1,
      isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
      hasTouch: 'ontouchstart' in window,
      isLandscape: window.innerWidth > window.innerHeight
    } as any);

    // Record initial navigation
    this.steps.push({
      type: 'navigate',
      url: window.location.href,
      assertedEvents: [{
        type: 'navigation',
        url: window.location.href,
        title: document.title
      }]
    });

    // Attach event listeners
    this.attachListeners();

    console.log('🎥 [Recorder] Started recording session:', { bugName, testerName });
  }

  /**
   * Stop recording and generate JSON
   */
  stopRecording(): RecordingSession | null {
    if (!this.recording || !this.metadata) {
      console.warn('⚠️ [Recorder] No active recording to stop');
      return null;
    }

    this.recording = false;
    this.metadata.endTime = new Date().toISOString();

    // Remove event listeners
    this.detachListeners();

    const session: RecordingSession = {
      title: `${this.metadata.bugName} - ${this.metadata.testerName}`,
      steps: this.steps,
      timeout: 5000,
      metadata: this.metadata
    };

    console.log('⏹️ [Recorder] Stopped recording. Total steps:', this.steps.length);

    // Reset state
    this.steps = [];
    this.metadata = null;

    return session;
  }

  /**
   * Attach event listeners for recording
   */
  private attachListeners() {
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('input', this.handleInput, true);
    document.addEventListener('change', this.handleChange, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    window.addEventListener('scroll', this.handleScroll, true);
  }

  /**
   * Detach event listeners
   */
  private detachListeners() {
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('input', this.handleInput, true);
    document.removeEventListener('change', this.handleChange, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);
    window.removeEventListener('scroll', this.handleScroll, true);
  }

  /**
   * Handle click events
   */
  private handleClick = (event: MouseEvent) => {
    if (!this.recording) return;

    // Get the actual clicked element (might be a child of button/link)
    let target = event.target as HTMLElement;

    // Traverse up to find the closest button, link, or interactive element
    const interactiveElement = this.findInteractiveElement(target);
    const elementToRecord = interactiveElement || target;

    const selectors = this.getSelectors(elementToRecord);

    if (!selectors || selectors.length === 0) return;

    this.steps.push({
      type: 'click',
      target: 'main',
      selectors: selectors,
      offsetX: event.offsetX,
      offsetY: event.offsetY
    });

    console.log('🖱️ [Recorder] Click:', selectors[0][0], 'Element:', elementToRecord.tagName);
  };

  /**
   * Handle input events (typing)
   */
  private handleInput = (event: Event) => {
    if (!this.recording) return;

    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const selectors = this.getSelectors(target);

    if (!selectors || selectors.length === 0) return;

    this.steps.push({
      type: 'change',
      target: 'main',
      selectors: selectors,
      value: target.value
    });

    console.log('⌨️ [Recorder] Input:', selectors[0][0], target.value);
  };

  /**
   * Handle change events (select, checkbox, radio)
   */
  private handleChange = (event: Event) => {
    if (!this.recording) return;

    const target = event.target as HTMLSelectElement | HTMLInputElement;
    const selectors = this.getSelectors(target);

    if (!selectors || selectors.length === 0) return;

    const value = target.type === 'checkbox'
      ? (target as HTMLInputElement).checked.toString()
      : target.value;

    this.steps.push({
      type: 'change',
      target: 'main',
      selectors: selectors,
      value
    });

    console.log('🔄 [Recorder] Change:', selectors[0][0], value);
  };

  /**
   * Handle keydown events
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.recording) return;

    // Only record special keys (Enter, Escape, Tab, etc.)
    if (event.key.length === 1) return; // Skip regular character keys

    const target = event.target as HTMLElement;
    const selectors = this.getSelectors(target);

    if (!selectors || selectors.length === 0) return;

    this.steps.push({
      type: 'keyDown',
      target: 'main',
      selectors: selectors,
      key: event.key
    });

    console.log('⌨️ [Recorder] KeyDown:', event.key, selectors[0][0]);
  };

  /**
   * Handle scroll events
   */
  private handleScroll = (event: Event) => {
    if (!this.recording) return;

    // Throttle scroll events (only record every 500ms)
    const now = Date.now();
    if (this.lastScrollTime && now - this.lastScrollTime < 500) return;
    this.lastScrollTime = now;

    this.steps.push({
      type: 'scroll',
      target: 'main',
      selectors: [['html']],
    });

    console.log('📜 [Recorder] Scroll');
  };

  private lastScrollTime: number | null = null;

  /**
   * Find the closest interactive element (button, link, input, etc.)
   * Traverses up the DOM tree to find a meaningful element to record
   */
  private findInteractiveElement(element: HTMLElement): HTMLElement | null {
    const maxDepth = 5; // Don't traverse too far up
    let current: HTMLElement | null = element;
    let depth = 0;

    while (current && depth < maxDepth) {
      const tagName = current.tagName.toLowerCase();

      // Check if this is an interactive element
      if (
        tagName === 'button' ||
        tagName === 'a' ||
        tagName === 'input' ||
        tagName === 'select' ||
        tagName === 'textarea' ||
        current.getAttribute('role') === 'button' ||
        current.hasAttribute('onclick') ||
        current.hasAttribute('data-testid')
      ) {
        return current;
      }

      current = current.parentElement;
      depth++;
    }

    return null;
  }

  /**
   * Generate multiple selector strategies like Chrome DevTools Recorder
   * Returns array of selector arrays for better replay reliability
   */
  private getSelectors(element: HTMLElement): string[][] {
    const selectors: string[][] = [];

    // 1. ARIA label (highest priority for accessibility)
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      selectors.push([`aria/${ariaLabel}`]);
    }

    // 2. Text content (for buttons/links)
    const textContent = element.textContent?.trim();
    if (textContent && textContent.length > 0 && textContent.length < 50) {
      // Only use text if it's reasonable length
      selectors.push([`text/${textContent}`]);
    }

    // 3. ID selector
    if (element.id) {
      selectors.push([`#${element.id}`]);
    }

    // 4. Data-testid
    if (element.getAttribute('data-testid')) {
      selectors.push([`[data-testid="${element.getAttribute('data-testid')}"]`]);
    }

    // 5. CSS selector (class-based)
    const cssSelector = this.generateCSSSelector(element);
    if (cssSelector) {
      selectors.push([cssSelector]);
    }

    // 6. XPath selector
    const xpath = this.generateXPath(element);
    if (xpath) {
      selectors.push([xpath]);
    }

    // 7. Pierce selector (same as CSS for our purposes)
    if (cssSelector) {
      selectors.push([`pierce/${cssSelector}`]);
    }

    return selectors.length > 0 ? selectors : [[element.tagName.toLowerCase()]];
  }

  /**
   * Generate CSS selector for an element
   */
  private generateCSSSelector(element: HTMLElement): string | null {
    // Try ID first
    if (element.id) {
      return `#${element.id}`;
    }

    // Try data-testid
    if (element.getAttribute('data-testid')) {
      return `[data-testid="${element.getAttribute('data-testid')}"]`;
    }

    // Try name attribute
    if (element.getAttribute('name')) {
      return `${element.tagName.toLowerCase()}[name="${element.getAttribute('name')}"]`;
    }

    // Try class-based selector with nth-of-type for specificity
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(c => c.length > 0);

      if (classes.length > 0) {
        const parent = element.parentElement;
        if (parent) {
          // Get siblings with same tag
          const siblings = Array.from(parent.children).filter(
            child => child.tagName === element.tagName
          );

          if (siblings.length > 1) {
            // Multiple siblings, use nth-of-type
            const index = siblings.indexOf(element) + 1;
            // Use first few classes for context
            const classSelector = classes.slice(0, 2).join('.');
            return `${element.tagName.toLowerCase()}.${classSelector}:nth-of-type(${index})`;
          } else {
            // Single sibling, just use classes
            const classSelector = classes.slice(0, 2).join('.');
            return `${element.tagName.toLowerCase()}.${classSelector}`;
          }
        } else {
          // No parent, just use classes
          const classSelector = classes.slice(0, 2).join('.');
          return `${element.tagName.toLowerCase()}.${classSelector}`;
        }
      }
    }

    // Fallback: use nth-child with parent context
    const parent = element.parentElement;
    if (parent) {
      const index = Array.from(parent.children).indexOf(element) + 1;
      return `${element.tagName.toLowerCase()}:nth-child(${index})`;
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Generate XPath for an element
   */
  private generateXPath(element: HTMLElement): string {
    if (element.id) {
      return `xpath///*[@id="${element.id}"]`;
    }

    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling: Element | null = current.previousElementSibling;

      while (sibling) {
        if (sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }

      const tagName = current.nodeName.toLowerCase();
      const pathIndex = index > 0 ? `[${index + 1}]` : '';
      parts.unshift(tagName + pathIndex);

      current = current.parentElement;
    }

    return `xpath///${parts.join('/')}`;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recording;
  }
}

// Export singleton instance
export const sessionRecorder = new SessionRecorder();
