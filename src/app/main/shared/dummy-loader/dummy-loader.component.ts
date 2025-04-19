// 📁 dummy-loader.component.ts
import { Component } from '@angular/core';
import { DummyImportService } from '../../../../services/dummy-import.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dummy-loader',
  imports: [CommonModule],
  templateUrl: './dummy-loader.component.html',
  styleUrls: ['./dummy-loader.component.scss'],
})
export class DummyLoaderComponent {
  isLoading = false;
  progressMessage = '';

  constructor(private dummyService: DummyImportService) {}

  async loadDummyData() {
    this.isLoading = true;
    this.progressMessage = '📦 Starte Import...';

    await this.dummyService.importDummyData((msg) => {
      this.progressMessage = msg;
    });

    this.isLoading = false;
  }
}
