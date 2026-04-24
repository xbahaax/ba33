import { hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../common/database/client';
import {
  buyerCatalogProducts,
  buyerComplaints,
  buyers,
  notifications,
  orderItems,
  orders as ordersTable,
  salesDocuments,
  shipments,
  users,
} from '../common/database/schema';
import { addresses, complaints, orders, products } from '../modules/sales/buyer-read-model';

const TEST_BUYER_ID = '00000000-0000-4000-8000-000000000001';
const TEST_EMAIL = 'buyer@ba33.dz';
const TEST_PASSWORD = 'Buyer@2026!';

type DbOrderStatus = typeof ordersTable.$inferSelect.status;

function toDbOrderStatus(status: string): DbOrderStatus {
  switch (status) {
    case 'confirmed':
      return 'confirmed';
    case 'preparing':
      return 'preparing';
    case 'shipped':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
      return 'cancelled';
    case 'disputed':
      return 'returned';
    case 'pending':
    default:
      return 'draft';
  }
}

function toDbDocType(type: string) {
  const map: Record<string, 'invoice' | 'traceability_certificate' | 'origin_certificate' | 'export_declaration' | 'other'> = {
    invoice: 'invoice',
    certificate: 'traceability_certificate',
    export: 'export_declaration',
    delivery: 'other',
  };
  return map[type] ?? 'other';
}

async function seedBuyerAccount() {
  await db
    .insert(users)
    .values({
      id: TEST_BUYER_ID,
      email: TEST_EMAIL,
      passwordHash: hashSync(TEST_PASSWORD, 10),
      fullName: 'Noura Benkhelifa',
      userType: 'buyer',
      status: 'active',
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: hashSync(TEST_PASSWORD, 10),
        fullName: 'Noura Benkhelifa',
        userType: 'buyer',
        status: 'active',
        updatedAt: new Date(),
      },
    });

  await db
    .insert(buyers)
    .values({
      userId: TEST_BUYER_ID,
      companyName: 'Noura Fibres',
      registrationNumber: '001612345678900',
      preferredChannel: 'export',
      creditLimit: '2500000',
      billingAddress: {
        sector: 'Textile technique',
        website: 'https://nourafibres.dz',
        firstName: 'Noura',
        lastName: 'Benkhelifa',
        phone: '+213 555 22 11 90',
        language: 'fr',
        currency: 'DZD',
        twoFactorEnabled: true,
        notifications: {
          orderConfirmations: true,
          shipments: true,
          newAvailability: false,
          offers: false,
        },
      },
      shippingAddresses: addresses,
    })
    .onConflictDoUpdate({
      target: buyers.userId,
      set: {
        companyName: 'Noura Fibres',
        registrationNumber: '001612345678900',
        preferredChannel: 'export',
        shippingAddresses: addresses,
      },
    });
}

async function seedCatalog() {
  for (const product of products) {
    await db
      .insert(buyerCatalogProducts)
      .values({
        id: product.id,
        code: product.code,
        name: product.name,
        type: product.type,
        grade: product.grade,
        region: product.region,
        availableQuantityKg: String(product.availableQuantityKg),
        pricePerKgDzd: String(product.pricePerKgDzd),
        pricePerKgEur: product.pricePerKgEur ? String(product.pricePerKgEur) : null,
        nfnSealStatus: product.nfnSealStatus,
        nfnSealCode: product.nfnSealCode,
        nfnCertifiedAt: product.nfnCertifiedAt ? new Date(product.nfnCertifiedAt) : null,
        description: product.description,
        images: product.images,
        qualityParameters: product.qualityParameters,
        traceability: product.traceability,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: buyerCatalogProducts.id,
        set: {
          name: product.name,
          availableQuantityKg: String(product.availableQuantityKg),
          pricePerKgDzd: String(product.pricePerKgDzd),
          nfnSealStatus: product.nfnSealStatus,
          updatedAt: new Date(),
        },
      });
  }
}

async function seedOrders() {
  for (const order of orders) {
    const existing = await db.select().from(ordersTable).where(eq(ordersTable.orderCode, order.id)).limit(1);
    const subtotal = order.items.reduce((sum, item) => sum + item.quantityKg * item.unitPriceDzd, 0);
    const [dbOrder] = existing[0]
      ? await db
          .update(ordersTable)
          .set({
            status: toDbOrderStatus(order.status),
            subtotal: String(subtotal),
            total: String(order.totalAmountDzd),
            shippingAddress: order.shippingAddress,
            deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.orderCode, order.id))
          .returning()
      : await db
          .insert(ordersTable)
          .values({
            orderCode: order.id,
            buyerId: TEST_BUYER_ID,
            channel: order.channel,
            status: toDbOrderStatus(order.status),
            paymentStatus: order.status === 'delivered' ? 'paid' : 'pending',
            subtotal: String(subtotal),
            tax: '0',
            total: String(order.totalAmountDzd),
            currency: order.channel === 'export' ? 'EUR' : 'DZD',
            shippingAddress: order.shippingAddress,
            deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
            createdAt: new Date(order.placedAt),
            updatedAt: new Date(),
          })
          .returning();

    await db.delete(orderItems).where(eq(orderItems.orderId, dbOrder.id));
    await db.insert(orderItems).values(
      order.items.map((item) => ({
        orderId: dbOrder.id,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        grade: item.grade,
        quantity: String(item.quantityKg),
        unitPrice: String(item.unitPriceDzd),
        subtotal: String(item.quantityKg * item.unitPriceDzd),
      })),
    );

    await db.delete(salesDocuments).where(eq(salesDocuments.orderId, dbOrder.id));
    await db.insert(salesDocuments).values(
      order.documents.map((document) => ({
        orderId: dbOrder.id,
        type: toDbDocType(document.type),
        fileId: randomUUID(),
        title: document.title,
        sizeLabel: document.sizeLabel,
        generatedAt: new Date(document.createdAt),
      })),
    );

    if (order.trackingNumber) {
      const existingShipment = await db.select().from(shipments).where(eq(shipments.orderId, dbOrder.id)).limit(1);
      if (existingShipment[0]) {
        await db
          .update(shipments)
          .set({
            status: order.status === 'delivered' ? 'delivered' : 'in_transit',
            trackingReference: order.trackingNumber,
            deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
          })
          .where(eq(shipments.orderId, dbOrder.id));
      } else {
        await db.insert(shipments).values({
          orderId: dbOrder.id,
          status: order.status === 'delivered' ? 'delivered' : 'in_transit',
          trackingReference: order.trackingNumber,
          shippedAt: order.status === 'shipped' ? new Date(order.placedAt) : null,
          deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
        });
      }
    }
  }
}

async function seedComplaints() {
  for (const complaint of complaints) {
    await db
      .insert(buyerComplaints)
      .values({
        id: complaint.id,
        buyerId: TEST_BUYER_ID,
        orderCode: complaint.orderId,
        type: complaint.type,
        status: complaint.status,
        submittedAt: new Date(complaint.submittedAt),
      })
      .onConflictDoUpdate({
        target: buyerComplaints.id,
        set: {
          type: complaint.type,
          status: complaint.status,
          updatedAt: new Date(),
        },
      });
  }
}

async function seedNotifications() {
  const items = [
    ['delivery', 'Expedition en route', 'Commande #CMD-2026-00142 expediee — arrivee estimee sous 7 jours', false],
    ['certificate', 'Nouveau certificat NFN', 'Le produit P1-00042 vient d etre certifie NFN Grade A', false],
    ['order', 'Commande confirmee', 'Commande #CMD-2026-00157 confirmee par le vendeur', false],
    ['complaint', 'Reclamation traitee', 'Votre reclamation #REC-2026-0037 a ete resolue', true],
  ] as const;

  for (const [type, title, body, read] of items) {
    const existing = await db
      .select()
      .from(notifications)
      .where(eq(notifications.title, title))
      .limit(1);

    if (existing[0]) {
      continue;
    }

    await db.insert(notifications).values({
      userId: TEST_BUYER_ID,
      type,
      title,
      body,
      payload: {},
      readAt: read ? new Date() : null,
      sentAt: new Date(),
    });
  }
}

async function main() {
  await seedBuyerAccount();
  await seedCatalog();
  await seedOrders();
  await seedComplaints();
  await seedNotifications();

  console.log(`Seed complete. Login with ${TEST_EMAIL} / ${TEST_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
