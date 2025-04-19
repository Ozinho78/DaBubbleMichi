// 📁 dummy-import.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DummyImportService {
  constructor(private firestore: Firestore) {}

  async importDummyData(onProgress?: (msg: string) => void): Promise<void> {
    const response = await fetch('/data/dummy-data-from-models.json');
    const data = await response.json();

    let step = 0;
    const total = data.users.length + data.channels.length;

    // Users importieren
    for (const user of data.users) {
      const userRef = doc(this.firestore, `users/${user.docId}`);
      await setDoc(userRef, user);
      onProgress?.(`User ${++step}/${total}: ${user.name}`);
    }

    // Channels importieren
    for (const channel of data.channels) {
      const channelRef = doc(this.firestore, `channels/${channel.docId}`);
      await setDoc(channelRef, channel);
      onProgress?.(`Channel ${++step}/${total}: ${channel.name}`);
    }

    onProgress?.('✅ Import abgeschlossen');
  }
}