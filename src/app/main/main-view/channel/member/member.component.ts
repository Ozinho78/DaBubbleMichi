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
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

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
    if (changes['channelId'] && this.channelIdInput) {
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
    if (!event || event.target === event.currentTarget) {
      this.isOpen = false;
      this.showUserList = false;
    }
  }

  openModalAddUser() {
    // tbc
    this.modalAddUser.openModal();
  }
}
