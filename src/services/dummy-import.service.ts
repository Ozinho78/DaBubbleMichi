// 📁 dummy-import.service.ts
import { Injectable } from '@angular/core';
import { Firestore, deleteDoc, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DummyImportService {
  dataUrl = '/data/dummy-data.json';


  constructor(private firestore: Firestore) {}

  async importDummyData(onProgress?: (msg: string) => void): Promise<void> {
    const response = await fetch(this.dataUrl);
    const data = await response.json();

    const fixedMembers = ["4s2jsCO69B0WMFs5PKDC", "X0cbEAhQNCSxOUCgoMb0"];

    let step = 0;
    const total = data.users.length + data.channels.length;

    // Users importieren
    for (const user of data.users) {
      const userRef = doc(this.firestore, `users/${user.docId}`);
      await setDoc(userRef, user);
      onProgress?.(`User ${++step}/${total}: ${user.name}`);
    }

    // Channels importieren
    for (let i = 0; i < data.channels.length; i++) {
      const channel = data.channels[i];
      const mustInclude = fixedMembers[i % 2];

      if (!channel.member.includes(mustInclude)) {
        channel.member.push(mustInclude);
      }

      const channelRef = doc(this.firestore, `channels/${channel.docId}`);
      await setDoc(channelRef, channel);
      onProgress?.(`Channel ${++step}/${total}: ${channel.name}`);
    }

    onProgress?.('✅ Import abgeschlossen');
  }

  async deleteAllDummyData(onProgress?: (msg: string) => void): Promise<void> {
    const response = await fetch(this.dataUrl);
    const data = await response.json();

    let step = 0;
    const total = data.users.length + data.channels.length;

    for (const user of data.users) {
      const userRef = doc(this.firestore, `users/${user.docId}`);
      await deleteDoc(userRef);
      onProgress?.(`User gelöscht ${++step}/${total}: ${user.name}`);
    }

    for (const channel of data.channels) {
      const channelRef = doc(this.firestore, `channels/${channel.docId}`);
      await deleteDoc(channelRef);
      onProgress?.(`Channel gelöscht ${++step}/${total}: ${channel.name}`);
    }

    onProgress?.('🗑️ Nur gelistete Dummy-Daten wurden gelöscht');
  }
}