// 📁 dummy-import.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class DummyImportService {
  constructor(private firestore: AngularFirestore) {}

  async importDummyData(onProgress?: (msg: string) => void): Promise<void> {
    const response = await fetch('/data/dummy-data-from-models.json');
    const data = await response.json();

    let step = 0;
    const total = data.users.length + data.channels.length;

    // Users importieren
    for (const user of data.users) {
      await this.firestore.collection('users').doc(user.docId).set(user);
      onProgress?.(`User ${++step}/${total}: ${user.name}`);
    }

    // Channels importieren
    for (const channel of data.channels) {
      await this.firestore.collection('channels').doc(channel.docId).set(channel);
      onProgress?.(`Channel ${++step}/${total}: ${channel.name}`);
    }

    onProgress?.('✅ Import abgeschlossen');
  }
}