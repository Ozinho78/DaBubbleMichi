import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddUserComponent } from '../add-user/add-user.component';
import { Channel } from '../../../../../models/channel.model';
import { UserService } from '../../../../../services/user.service';
import { User } from '../../../../../models/user.model';
import { collection, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-member',
  imports: [CommonModule],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss',
})
export class MemberComponent implements OnInit, OnChanges {
  @ViewChild(AddUserComponent) modalAddUser!: AddUserComponent;

  @Input() channelIdInput!: string;
  @Output() closeModal = new EventEmitter<void>();

  isOpen = false;
  showUserList: boolean = false;
  channelId!: string;
  selectedChannelId: string = '';
  members: User[] = [];
  userLoggedIn = localStorage.getItem('user-id') || '';
  allUsers: User[] = [];
  availableUsers: User[] = [];
  showAddUserModal = false;


  constructor(private firestore: Firestore) {
    setTimeout(() => {
      this.userLoggedIn = localStorage.getItem('user-id') || '';
    }, 1000);
  }

  ngOnInit(): void {
    if (this.channelIdInput) {
      this.loadMembers();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("ChannelId :" , this.channelIdInput);
    if (changes['channelIdInput']) {
      this.loadMembers();
    }
  }

  async loadMembers() {
    try {
      const channelRef = doc(this.firestore, 'channels', this.channelIdInput);
      const channelSnap = await getDoc(channelRef);

      if (!channelSnap.exists()) return;

      const memberIds: string[] = channelSnap.data()['member'] || [];

      const memberPromises = memberIds.map(async (uid) => {
        const userSnap = await getDoc(doc(this.firestore, 'users', uid));
        return userSnap.exists()
          ? ({ docId: uid, ...userSnap.data() } as User)
          : null;
      });

      const loadedMembers = await Promise.all(memberPromises);
      this.members = loadedMembers.filter((u): u is User => !!u);

    } catch (error) {
      console.error('Fehler beim Laden der Mitglieder:', error);
    }
  }

  openModal() {
    this.isOpen = true;
  }

  close(event?: Event) {
    // if (!event || event.target === event.currentTarget) {
    //   this.isOpen = false;
    //   this.showUserList = false;
    // }
    this.isOpen = false;
    this.showUserList = false;
  }

  async openModalAddUser() {
    this.showAddUserModal = true;
  
    const userSnaps = await getDocs(collection(this.firestore, 'users'));
    const users: User[] = [];
  
    userSnaps.forEach((docSnap) => {
      users.push({ docId: docSnap.id, ...(docSnap.data() as Omit<User, 'docId'>) });
    });
  
    this.allUsers = users;
  
    // Nur User anzeigen, die noch nicht Mitglied sind
    const memberIds = this.members.map((m) => m.docId);
    this.availableUsers = this.allUsers.filter(user => !memberIds.includes(user.docId));
  }

  async addMember(user: User) {
    const channelRef = doc(this.firestore, 'channels', this.channelIdInput);
    const channelSnap = await getDoc(channelRef);
  
    if (!channelSnap.exists()) return;
  
    const data = channelSnap.data();
    const currentMembers: string[] = Array.isArray(data['member']) ? data['member'] : [];
  
    const updatedMembers = [...currentMembers, user.docId];
  
    await updateDoc(channelRef, {
      member: updatedMembers
    });
  
    // neu laden
    this.loadMembers();
    this.showAddUserModal = false;
  }


  async removeMember(user: User) {
    const channelRef = doc(this.firestore, 'channels', this.channelIdInput);
    const channelSnap = await getDoc(channelRef);
  
    if (!channelSnap.exists()) return;
  
    const data = channelSnap.data();
    const currentMembers: string[] = Array.isArray(data['member']) ? data['member'] : [];
  
    const updatedMembers = currentMembers.filter(id => id !== user.docId);
  
    await updateDoc(channelRef, {
      member: updatedMembers
    });
  
    this.loadMembers(); // Reload Members
  }
}
