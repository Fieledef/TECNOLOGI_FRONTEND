import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingCount = signal(0);
  isLoading = this.loadingCount.asReadonly();

  start() {
    this.loadingCount.update(count => count + 1);
  }

  stop() {
    this.loadingCount.update(count => Math.max(0, count - 1));
  }

  reset() {
    this.loadingCount.set(0);
  }
}

