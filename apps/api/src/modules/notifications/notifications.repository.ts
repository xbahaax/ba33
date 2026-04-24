import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

export interface BuyerNotification {
  id: string;
  type: 'order' | 'delivery' | 'certificate' | 'complaint';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

@Injectable()
export class NotificationsRepository {
  private readonly notifications: BuyerNotification[] = [
    {
      id: 'n1',
      type: 'delivery',
      title: 'Expedition en route',
      description: 'Commande #CMD-20240312 expediee — arrivee estimee 26 Avr',
      time: 'Il y a 10 min',
      read: false,
    },
    {
      id: 'n2',
      type: 'certificate',
      title: 'Nouveau certificat NFN',
      description: 'Le produit P1-00042 vient d\'etre certifie NFN Grade A',
      time: 'Il y a 1h',
      read: false,
    },
    {
      id: 'n3',
      type: 'order',
      title: 'Commande confirmee',
      description: 'Commande #CMD-20240311 confirmee par le vendeur',
      time: 'Il y a 3h',
      read: false,
    },
    {
      id: 'n4',
      type: 'complaint',
      title: 'Reclamation traitee',
      description: 'Votre reclamation #REC-2024-01 a ete resolue',
      time: 'Hier',
      read: true,
    },
  ];

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  list(): BuyerNotification[] {
    return this.notifications;
  }

  markAllRead(): BuyerNotification[] {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    return this.notifications;
  }

  dismiss(notificationId: string): { deleted: boolean } {
    const index = this.notifications.findIndex((notification) => notification.id === notificationId);

    if (index < 0) {
      return { deleted: false };
    }

    this.notifications.splice(index, 1);
    return { deleted: true };
  }
}
