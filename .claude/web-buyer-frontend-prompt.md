# Prompt d'Implémentation — Frontend `web-buyer` (ba33 Platform)

## Contexte du projet

Tu implémente le frontend du portail B2B **`web-buyer`** de la plateforme **ba33** — un système de traçabilité de laine en Algérie. Ce portail est destiné aux acheteurs professionnels (industries textiles, coopératives agricoles, acheteurs à l'export) qui consultent des produits certifiés NFN, passent des commandes, et vérifient la traçabilité de leur laine de la brebis jusqu'au produit fini.

**Stack technique :**
- **Next.js 15** avec App Router (`app/` directory)
- **TypeScript** strict (`strict: true`, zéro `any` sans commentaire)
- **Tailwind CSS v4** avec les tokens CSS fournis ci-dessous
- **shadcn/ui** comme couche de base des composants (customisé via les tokens, jamais éditer les fichiers shadcn directement)
- **Lucide React** pour les icônes
- **Recharts** pour les graphiques de tracing
- Structure de routes dans `app/(buyer)/` — groupe de routes sans layout landing

---

## 1. Système de Design — Règles ABSOLUES

### 1.1 CSS Global à copier tel quel dans `globals.css`

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1.0000 0 0);
  --foreground: oklch(0.1408 0.0044 285.8229);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.1408 0.0044 285.8229);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.1408 0.0044 285.8229);
  --primary: oklch(0.6000 0.1180 184.7040);
  --primary-foreground: oklch(0.2734 0.0743 130.6483);
  --secondary: oklch(1 0 0);
  --secondary-foreground: oklch(0.2103 0.0059 285.8852);
  --muted: oklch(0.9674 0.0013 286.3752);
  --muted-foreground: oklch(0.5517 0.0138 285.9385);
  --accent: oklch(1 0 0);
  --accent-foreground: oklch(0.2103 0.0059 285.8852);
  --destructive: oklch(0.5770 0.2450 27.3250);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.8711 0.0055 286.2860);
  --input: oklch(0.8711 0.0055 286.2860);
  --ring: oklch(0.8882 0.1981 125.5383);
  --chart-1: oklch(0.8882 0.1981 125.5383);
  --chart-2: oklch(0.7462 0.1803 129.9390);
  --chart-3: oklch(0.6298 0.1711 134.0963);
  --chart-4: oklch(0.6667 0.1462 147.9698);
  --chart-5: oklch(0.5677 0.1372 148.6279);
  --sidebar: oklch(0.9851 0 0);
  --sidebar-foreground: oklch(0.1450 0 0);
  --sidebar-primary: oklch(0.8882 0.1981 125.5383);
  --sidebar-primary-foreground: oklch(0.2734 0.0743 130.6483);
  --sidebar-accent: oklch(0.9700 0 0);
  --sidebar-accent-foreground: oklch(0.2050 0 0);
  --sidebar-border: oklch(0.8711 0.0055 286.2860);
  --sidebar-ring: oklch(0.8882 0.1981 125.5383);
  --font-sans: Roboto Flex, ui-sans-serif, sans-serif, system-ui;
  --font-serif: Asul, ui-serif, serif;
  --font-mono: JetBrains Mono, ui-monospace, monospace;
  --radius: 0.75rem;
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  --spacing: 0.25rem;
}

.dark {
  --background: oklch(0.1913 0 0);
  --foreground: oklch(0.9851 0 0);
  --card: oklch(0.2350 0 0);
  --card-foreground: oklch(0.9851 0 0);
  --popover: oklch(0.2603 0 0);
  --popover-foreground: oklch(0.9851 0 0);
  --primary: oklch(0.8882 0.1981 125.5383);
  --primary-foreground: oklch(0.2734 0.0743 130.6483);
  --secondary: oklch(0.2739 0.0055 286.0326);
  --secondary-foreground: oklch(0.9851 0 0);
  --muted: oklch(0.2739 0.0055 286.0326);
  --muted-foreground: oklch(0.7118 0.0129 286.0665);
  --accent: oklch(0.3703 0.0119 285.8054);
  --accent-foreground: oklch(0.9851 0 0);
  --destructive: oklch(0.7040 0.1910 22.2160);
  --destructive-foreground: oklch(0.9850 0 0);
  --border: oklch(0.3703 0.0119 285.8054);
  --input: oklch(0.3703 0.0119 285.8054);
  --ring: oklch(0.8882 0.1981 125.5383);
  --chart-1: oklch(0.8882 0.1981 125.5383);
  --chart-2: oklch(0.7462 0.1803 129.9390);
  --chart-3: oklch(0.6298 0.1711 134.0963);
  --chart-4: oklch(0.6667 0.1462 147.9698);
  --chart-5: oklch(0.5677 0.1372 148.6279);
  --sidebar: oklch(0.1684 0 0);
  --sidebar-foreground: oklch(0.9851 0 0);
  --sidebar-primary: oklch(0.8882 0.1981 125.5383);
  --sidebar-primary-foreground: oklch(0.2734 0.0743 130.6483);
  --sidebar-accent: oklch(0.3703 0.0119 285.8054);
  --sidebar-accent-foreground: oklch(0.9851 0 0);
  --sidebar-border: oklch(0.3703 0.0119 285.8054);
  --sidebar-ring: oklch(0.8882 0.1981 125.5383);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

### 1.2 Règles de design — INTERDICTIONS ABSOLUES

- ❌ Jamais de valeur de couleur raw (`#...`, `rgb(...)`) dans le code
- ❌ Jamais de `color: Color(...)` — uniquement les tokens (`bg-primary`, `text-foreground`, etc.)
- ❌ Jamais de `border-radius: 0` — ba33 est un système à coins arrondis, `rounded-none` interdit
- ❌ Jamais d'ombre manuelle — utiliser uniquement les shadows du token (`shadow-sm`, `shadow-lg`, etc.)
- ❌ Jamais de quatrième police — seulement `font-sans` (Roboto Flex), `font-serif` (Asul), `font-mono` (JetBrains Mono)
- ❌ Jamais `text-body` en `font-serif` — serif uniquement pour les certificats NFN et documents officiels
- ❌ Jamais d'espacement inventé (`padding: 13px`) — utiliser uniquement l'échelle Tailwind (multiples de 4px)
- ❌ Ne jamais sauter des couleurs de graphique (`chart-1` → `chart-3`) — utiliser dans l'ordre

### 1.3 Règles de design — OBLIGATIONS

- ✅ `font-mono` pour tous les IDs, poids, codes lot, timestamps dans les tableaux
- ✅ `rounded-lg` (12px) par défaut pour les boutons, inputs, cartes
- ✅ `rounded-full` pour les avatars et badges pilule
- ✅ `rounded-xl` pour les modals, hero cards, panneaux importants
- ✅ `rounded-sm` pour les badges/chips et petites étiquettes
- ✅ Les paires fond/texte restent ensemble : `bg-primary text-primary-foreground`, `bg-card text-card-foreground`, `bg-destructive text-destructive-foreground`, etc.
- ✅ `shadow-xs` pour les cartes au repos, `shadow-sm` au hover
- ✅ `shadow-lg` pour les modals et dialogs
- ✅ Dark mode obligatoire — tout composant testé en `.dark` avant livraison
- ✅ Hiérarchie des ombres respectée : une card (`shadow-xs`) ne peut pas être au-dessus d'une modal (`shadow-lg`)

### 1.4 Tokens sémantiques — usage

| Token | Usage exact |
|---|---|
| `bg-background / text-foreground` | Page/écran racine |
| `bg-card / text-card-foreground` | Cartes, panneaux, modals élevées |
| `bg-popover / text-popover-foreground` | Dropdowns, tooltips, menus flottants |
| `bg-muted / text-muted-foreground` | États inactifs, placeholder, texte secondaire |
| `bg-accent / text-accent-foreground` | Hover states, sélection, emphase douce |
| `bg-primary / text-primary-foreground` | CTA principal, bouton principal, nav active |
| `bg-secondary / text-secondary-foreground` | Actions secondaires |
| `bg-destructive / text-destructive-foreground` | Suppression, erreur, danger |
| `border-border` | Toutes les bordures, séparateurs |
| `border-input` | Bordures des inputs (même valeur, nom sémantique distinct) |
| `ring` | Focus ring sur les éléments interactifs |
| `bg-sidebar / text-sidebar-foreground` | Surface et texte de la sidebar |
| `bg-sidebar-primary / text-sidebar-primary-foreground` | Item actif dans la sidebar |
| `bg-sidebar-accent / text-sidebar-accent-foreground` | Hover dans la sidebar |

---

## 2. Architecture des fichiers

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── verify-otp/page.tsx
├── (buyer)/
│   ├── layout.tsx                    ← Layout principal avec sidebar + topbar
│   ├── catalog/
│   │   └── page.tsx                  ← Catalogue produits
│   ├── catalog/[productId]/
│   │   └── page.tsx                  ← Détail produit + traceabilité
│   ├── verify/
│   │   └── page.tsx                  ← Vérification certificat (QR ou code)
│   ├── cart/
│   │   └── page.tsx                  ← Panier
│   ├── checkout/
│   │   └── page.tsx                  ← Tunnel de commande
│   ├── orders/
│   │   ├── page.tsx                  ← Liste des commandes
│   │   └── [orderId]/
│   │       └── page.tsx              ← Détail commande + tracking
│   ├── documents/
│   │   └── page.tsx                  ← Centre de documents téléchargeables
│   ├── complaints/
│   │   ├── page.tsx                  ← Liste des réclamations
│   │   └── new/page.tsx              ← Formulaire nouvelle réclamation
│   └── account/
│       ├── page.tsx                  ← Profil entreprise
│       ├── addresses/page.tsx        ← Adresses de livraison
│       └── settings/page.tsx         ← Paramètres et sécurité
components/
├── buyer/
│   ├── layout/
│   │   ├── BuyerSidebar.tsx
│   │   ├── BuyerTopbar.tsx
│   │   └── BuyerMobileNav.tsx
│   ├── catalog/
│   │   ├── ProductCard.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductGrid.tsx
│   │   └── NfnSealBadge.tsx
│   ├── product/
│   │   ├── TraceabilityTimeline.tsx
│   │   ├── TraceabilityMap.tsx
│   │   ├── QualityParameters.tsx
│   │   └── ProductImageGallery.tsx
│   ├── orders/
│   │   ├── OrderStatusBadge.tsx
│   │   ├── OrderTimeline.tsx
│   │   ├── ShipmentTracker.tsx
│   │   └── OrderCard.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   ├── CheckoutSteps.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   └── OrderSummaryPanel.tsx
│   ├── documents/
│   │   ├── DocumentCard.tsx
│   │   └── DocumentPreviewModal.tsx
│   ├── complaints/
│   │   └── ComplaintForm.tsx
│   └── shared/
│       ├── LotIdChip.tsx
│       ├── WeightDisplay.tsx
│       ├── GradeBadge.tsx
│       └── LanguageSwitcher.tsx
lib/
├── types/
│   ├── product.ts
│   ├── order.ts
│   ├── traceability.ts
│   └── document.ts
└── mock/
    ├── products.ts
    ├── orders.ts
    └── traceability.ts
```

---

## 3. Layout Principal — `app/(buyer)/layout.tsx`

### Description UX
Le layout est une **sidebar fixe à gauche** (280px) avec un **topbar** collant en haut. La sidebar utilise les tokens `sidebar-*` dédiés. Le contenu principal utilise `bg-background`. Le dark mode est contrôlé par la classe `.dark` sur `<html>`.

### Sidebar — Spécifications complètes

**Surface :** `bg-sidebar` / `text-sidebar-foreground`
**Bordure droite :** `border-r border-sidebar-border`
**Shadow :** aucune (la sidebar ne s'élève pas, elle est ancrée)

**Logo ba33 :**
- En haut de la sidebar, 64px de hauteur
- Nom "ba33" en `font-serif` (Asul), taille `text-2xl`, couleur `text-sidebar-foreground`
- Badge "Portail Acheteur" en dessous en `text-xs font-mono text-muted-foreground`
- Séparateur `border-sidebar-border` sous le logo

**Navigation items :**
Groupes de navigation avec labels de section :

Groupe "Achats" :
- 🗂 Catalogue (`/catalog`) — icône `Package`
- 🛒 Mon Panier (`/cart`) — icône `ShoppingCart` + badge quantité si panier non vide
- 📋 Mes Commandes (`/orders`) — icône `ClipboardList`

Groupe "Documents" :
- 📄 Documents (`/documents`) — icône `FileText`
- 🏅 Vérifier un certificat (`/verify`) — icône `ShieldCheck`

Groupe "Compte" :
- 👤 Mon Profil (`/account`) — icône `User`
- 📍 Adresses (`/account/addresses`) — icône `MapPin`
- ⚙️ Paramètres (`/account/settings`) — icône `Settings`

**Style des nav items :**
- Repos : `text-sidebar-foreground`, fond transparent, `rounded-lg`, padding `px-3 py-2`
- Hover : `bg-sidebar-accent text-sidebar-accent-foreground`
- Actif : `bg-sidebar-primary text-sidebar-primary-foreground font-medium`
- Icône : 18px, toujours à gauche du label

**Bas de sidebar :**
- Avatar + nom de l'entreprise connectée
- Bouton déconnexion discret avec icône `LogOut`
- Toggle dark mode (icône soleil/lune)

### Topbar — Spécifications complètes

**Surface :** `bg-background/95 backdrop-blur-sm`
**Bordure bas :** `border-b border-border`
**Shadow :** `shadow-sm`
**Height :** 64px, `sticky top-0 z-40`

Contenu de gauche à droite :
- Bouton menu hamburger (mobile only, `lg:hidden`)
- Fil d'Ariane (breadcrumb) : page courante, `text-muted-foreground text-sm`
- Spacer flexible
- Barre de recherche globale : input `bg-muted rounded-lg px-3 py-2 text-sm w-64`, placeholder "Chercher un produit, une commande..." — icône `Search` à gauche
- Sélecteur de langue : dropdown avec drapeaux 🇫🇷 🇸🇦 🇬🇧
- Cloche de notification : icône `Bell` avec badge rouge si notifications non lues
- Avatar utilisateur : `rounded-full` 36px, ouvre un dropdown avec Profil, Paramètres, Déconnexion

### Responsive
- **≥ lg (1024px+) :** sidebar fixe visible, pas de topbar hamburger
- **< lg :** sidebar cachée, topbar avec hamburger → sidebar en drawer `Sheet` shadcn

---

## 4. Pages — Spécifications Détaillées

---

### 4.1 Page Catalogue — `/catalog`

**But :** Permettre à l'acheteur de parcourir tous les produits P1 (isolants/géotextiles) et P2 (biofertilisants) disponibles, filtrés et triés selon ses critères. Cette page est la plus visitée.

#### Header de page
- Titre `h1` : "Catalogue Produits" — `font-sans font-semibold text-2xl text-foreground`
- Sous-titre : "Produits certifiés NFN disponibles à la commande" — `text-muted-foreground text-sm`
- Compteur résultats : ex. "143 produits disponibles" — `font-mono text-sm text-muted-foreground`
- Bouton à droite : "Voir mes demandes de devis" avec icône `FileText` — variant `outline`

#### Barre de filtres (sticky, `top-16 z-30`)

**Surface :** `bg-background border-b border-border py-3`

Filtres disponibles en ligne :
1. **Type de produit** — `Select` shadcn : "Tous", "P1 — Isolants & Géotextiles", "P2 — Biofertilisants"
2. **Grade** — groupe de `ToggleGroup` : A (vert), B (bleu), C (orange) — multi-select possible
3. **Région d'origine** — `Select` : dropdown avec wilayas d'Algérie
4. **Disponibilité** — `Switch` : "En stock uniquement"
5. **Sceau NFN** — `Switch` : "Certifiés NFN uniquement"
6. **Tri** — `Select` : "Prix croissant", "Prix décroissant", "Grade (A→C)", "Disponibilité", "Plus récents"
7. Bouton "Réinitialiser" : `variant="ghost"` avec icône `X`, visible seulement si filtres actifs
8. Affichage : toggle grille/liste — icônes `LayoutGrid` et `List`

#### Grille de produits

**Mode Grille (défaut) :** 3 colonnes sur desktop, 2 sur tablette, 1 sur mobile — `gap-6`

**ProductCard — spécifications complètes :**

Structure :
```
[IMAGE 240px] ← bg-muted si pas d'image, icône Package centrée
[GRADE BADGE + NFN SEAL]  ← positionnés en overlay sur l'image en haut à droite
[CONTENU CARTE]
  Product code  ← font-mono text-xs text-muted-foreground (ex: P1-00042)
  Nom produit   ← font-sans font-semibold text-base (ex: "Panneau isolant laine brute 10cm")
  Région        ← text-sm text-muted-foreground avec icône MapPin 14px
  Disponible    ← font-mono font-medium (ex: "1 240 kg disponibles")
  Prix au kg    ← font-mono font-bold text-lg text-primary (ex: "890 DZD/kg")
  [ACTIONS] ← flex row
    Bouton "Voir détails"  ← variant="outline" flex-1
    Bouton "Ajouter panier" ← variant="default" flex-1, icône ShoppingCart
```

**Surface :** `bg-card border border-border rounded-xl shadow-xs hover:shadow-sm transition-shadow`

**GradeBadge :**
- Grade A : `bg-chart-1/15 text-chart-1 border-chart-1/30` — police `font-mono font-bold`
- Grade B : `bg-chart-2/15 text-chart-2 border-chart-2/30`
- Grade C : `bg-chart-3/15 text-chart-3 border-chart-3/30`
- Radius : `rounded-sm`

**NfnSealBadge :**
- Si certifié NFN : badge vert avec icône `ShieldCheck` + texte "NFN Certifié" — `bg-chart-1/20 text-chart-1 border border-chart-1/40 rounded-sm`
- Si non certifié : badge gris discret `bg-muted text-muted-foreground rounded-sm`

**Mode Liste :** chaque produit affiché en ligne horizontale — photo 80px, infos étirées, bouton d'action à droite

#### Pagination
Pagination numérotée en bas, style shadcn `Pagination`, `font-mono text-sm`

#### État vide
Si aucun produit après filtrage :
- Icône `PackageSearch` grand (64px) en `text-muted-foreground/40`
- Titre "Aucun produit trouvé" en `text-foreground`
- Sous-titre "Essayez de modifier vos filtres" en `text-muted-foreground`
- Bouton "Réinitialiser les filtres"

---

### 4.2 Page Détail Produit — `/catalog/[productId]`

**But :** Afficher toutes les informations d'un produit certifié, sa traceabilité complète de la source jusqu'au produit fini, et permettre l'ajout au panier ou la demande de devis.

#### Layout : 2 colonnes sur desktop (7/5 split), 1 colonne sur mobile

#### Colonne gauche (7/12)

**Galerie d'images :**
- Image principale grande — `rounded-xl bg-muted aspect-[4/3]`
- Miniatures en ligne sous — `rounded-lg`, bordure `border-2 border-primary` si sélectionnée
- Si pas d'image : icône `Package` centrée sur fond `bg-muted rounded-xl`

**Informations produit :**
- Code produit : `font-mono text-sm text-muted-foreground` (ex: `P1-00042-X7`)
- Nom : `font-sans font-bold text-2xl text-foreground`
- Badges en ligne : GradeBadge + NfnSealBadge + badge type (P1/P2)
- Description courte : `text-muted-foreground text-sm leading-relaxed`

**Paramètres de qualité — tableau ou grille 2×N :**

Chaque paramètre affiché en `bg-muted rounded-lg p-3` :
- Longueur fibre : valeur en `font-mono font-bold`, label en `text-xs text-muted-foreground`
- Diamètre (microns) : idem
- Teneur en humidité : idem  
- Rendement au lavage (R1) : barre de progression + pourcentage `font-mono`
- Couleur : swatch circulaire + description
- Note de propreté : étoiles 1→5
- Lot source : `font-mono text-primary` cliquable

**Section Traceabilité (accordéon expansible par défaut)**

Titre de section : "🌿 Traçabilité Complète" — `font-sans font-semibold text-lg`
Sous-titre : "De la brebis au produit — vérifiable, immuable"

**Timeline verticale (TraceabilityTimeline) :**

Chaque étape est un nœud dans la timeline avec :
- Cercle coloré (couleur selon phase) + icône
- Titre de l'étape + date/heure en `font-mono text-xs text-muted-foreground`
- Sous-infos (poids, lieu, opérateur masqué par RGPD)
- Statut : "✓ Validé" en `text-chart-1` ou "⚠ Signalé" en `text-destructive`

Étapes de la timeline (dans l'ordre chronologique) :
1. 🐑 **Collecte** — `chart-1` : Source C1/C2/C3, région (commune), date collecte, poids brut déclaré
2. 🏭 **Dépôt D1** — `chart-2` : Date réception, poids pesé (audit E1), écart déclaré/pesé en `font-mono`
3. 🚛 **Transport** — `chart-3` : Date départ D1, date arrivée D2, kilomètres, chaîne du froid si C2
4. 🧺 **Laverie D2** — `chart-4` : Poids sale → poids propre, rendement R1, grade assigné, date
5. 🏗 **Transformation** — `chart-5` : D3 ou D4, numéro batch production, poids input → output, date
6. 🏅 **Certification NFN** — `ring` : Date certification, numéro de sceau, signature cryptographique tronquée en `font-mono text-xs`

**Carte de traceabilité géographique (TraceabilityMap):**
Carte SVG stylisée de l'Algérie avec la wilaya d'origine mise en surbrillance `fill-chart-1/30 stroke-chart-1`. Pas de vraie map API — SVG statique stylisé suffit.

#### Colonne droite (5/12) — sticky à `top-20`

**Panneau d'achat — `bg-card border border-border rounded-xl shadow-sm p-6`**

Prix :
- "Prix unitaire" : `text-muted-foreground text-sm`
- Valeur : `font-mono font-bold text-3xl text-primary` (ex: `890 DZD`)
- Unité : `/kg` en `text-muted-foreground`
- Indicateur "Prix canal export" si applicable — `text-xs text-muted-foreground`

Disponibilité :
- Quantité dispo : `font-mono font-semibold text-foreground` (ex: `1 240 kg`)
- Barre de stock : Progress bar `bg-muted` → `bg-chart-1`, `rounded-full`
- Délai de livraison estimé : `text-muted-foreground text-sm` avec icône `Clock`

Sélecteur de quantité :
- Input `type="number"` avec boutons `-` et `+` de part et d'autre
- Minimum 50kg, max = stock disponible
- Sous l'input : total calculé en `font-mono font-semibold text-foreground`

Boutons d'action :
- "Ajouter au panier" — `variant="default" w-full` — icône `ShoppingCart`
- "Demander un devis" — `variant="outline" w-full` — icône `FileText`

Canal de vente (radio buttons stylisés) :
- 🇩🇿 National (DZD)
- 🌍 Export (EUR/USD)
- 🏛 Institutionnel (contrat cadre)

Encart certification :
- `bg-chart-1/10 border border-chart-1/30 rounded-xl p-4`
- Icône `ShieldCheck` en `text-chart-1`
- "Sceau NFN #XXXXXXXX" en `font-mono text-sm font-bold text-chart-1`
- "Certifié le [date]" en `text-xs text-muted-foreground`
- Bouton "Vérifier en ligne" → ouvre `/verify` avec l'ID pré-rempli

---

### 4.3 Page Vérification Certificat — `/verify`

**But :** Permettre à tout utilisateur (même sans compte) de vérifier l'authenticité d'un certificat NFN en entrant un code ou en scannant un QR.

#### Layout centré, max-width 640px, `mx-auto py-16`

**Header :**
- Icône `ShieldCheck` grande (48px) en `text-primary` centrée
- Titre : "Vérification de Certificat NFN" — `font-serif font-bold text-2xl text-center` ← serif car moment officiel
- Sous-titre : "Vérifiez l'authenticité d'un produit certifié ba33/NFN" — `text-muted-foreground text-center`

**Zone de saisie :**
- Onglets shadcn `Tabs` : "Entrer un code" | "Scanner un QR"

Onglet "Entrer un code" :
```
Input : placeholder "NFN-P1-00042-X7..."  ← font-mono, rounded-lg
Bouton "Vérifier" : variant="default" w-full
```

Onglet "Scanner un QR" :
- Cadre de caméra simulé (pour la maquette) — `bg-muted rounded-xl aspect-square flex items-center justify-center`
- Texte "Pointez vers le QR du certificat" en `text-muted-foreground text-sm`
- Icône `QrCode` centrée, grande

**Résultat — 3 états possibles :**

État "Certificat Valide" :
- `bg-chart-1/10 border-2 border-chart-1 rounded-xl p-6`
- Icône `CheckCircle` `text-chart-1` large + "Certificat Valide" en `font-sans font-bold text-xl text-chart-1`
- Tableau d'infos : Code produit, Grade, Région, Date certification, Statut ("✓ Actif")
- Bouton "Voir la traçabilité complète" → `/catalog/[productId]`
- Bouton "Télécharger le certificat PDF" → icône `Download`

État "Certificat Révoqué" :
- `bg-destructive/10 border-2 border-destructive rounded-xl p-6`
- Icône `XCircle` `text-destructive` + "Certificat Révoqué"
- Motif de révocation + date
- Contact support

État "Code non trouvé" :
- `bg-muted border border-border rounded-xl p-6`
- Icône `HelpCircle` `text-muted-foreground`
- "Aucun certificat trouvé pour ce code"
- Suggestions (vérifier la saisie)

---

### 4.4 Page Panier — `/cart`

**But :** Résumé des produits ajoutés avant la commande, modification des quantités, aperçu des totaux par canal.

#### Layout 2 colonnes (8/4 split) sur desktop, 1 colonne sur mobile

#### Colonne gauche — Items du panier

Header :
- "🛒 Mon Panier" — `font-sans font-semibold text-xl`
- Compteur : "(3 articles)" en `text-muted-foreground`
- Bouton "Vider le panier" — `variant="ghost" text-destructive`

**CartItem — pour chaque produit :**
- `bg-card border border-border rounded-xl p-4 flex gap-4`
- Photo 80×80 `rounded-lg bg-muted` à gauche
- Bloc infos : code `font-mono text-xs text-muted-foreground`, nom `font-semibold`, grade badge, région
- Quantité : input `-` `[XX kg]` `+` avec min/max
- Prix total ligne : `font-mono font-bold text-foreground` à droite
- Bouton supprimer : icône `Trash2` en `text-muted-foreground hover:text-destructive`
- Séparateur `border-border` entre items

#### Colonne droite — CartSummary (sticky)

- `bg-card border border-border rounded-xl shadow-sm p-6`
- "Récapitulatif" — `font-semibold text-foreground`
- Ligne : "Sous-total (X articles)" — `font-mono`
- Ligne : "Estimation livraison" — `text-muted-foreground` + "À calculer selon adresse"
- Séparateur
- "Total estimé" — `font-mono font-bold text-xl text-primary`
- Indicateur de devise (DZD / EUR selon canal sélectionné)
- Note fiscale : "TVA non incluse pour l'export" — `text-xs text-muted-foreground`
- Bouton "Passer la commande" — `variant="default" w-full text-base py-3`
- Bouton "Continuer mes achats" — `variant="outline" w-full`
- Encart sécurité : icône `Lock` + "Paiement sécurisé" — `text-xs text-muted-foreground`

État panier vide :
- Icône `ShoppingCart` 64px `text-muted-foreground/40`
- "Votre panier est vide"
- Bouton "Voir le catalogue" — `variant="default"`

---

### 4.5 Page Checkout — `/checkout`

**But :** Tunnel de commande en 3 étapes : adresse + canal → paiement → confirmation.

#### CheckoutSteps — barre de progression en haut

```
[1. Livraison] ——————— [2. Paiement] ——————— [3. Confirmation]
```
- Étape active : cercle `bg-primary text-primary-foreground`
- Étape complétée : cercle `bg-chart-1 text-chart-1-foreground` + icône `Check`
- Étape future : cercle `bg-muted text-muted-foreground border border-border`
- Lignes de connexion : `bg-border` (gris) ou `bg-chart-1` si complétée

#### Layout 2 colonnes (7/5) — formulaire gauche, récap commande droite

#### Étape 1 — Livraison

Section "Adresse de livraison" :
- Cards cliquables pour les adresses sauvegardées — `border-2 border-transparent hover:border-primary` → `border-primary` si sélectionnée, `rounded-xl p-4`
- Bouton "+ Nouvelle adresse" — `variant="outline" rounded-xl`

Section "Canal de vente" :
- 3 cards radio verticales :
  - 🇩🇿 **National** — "Facturation DZD, virement bancaire ou BaridiMob"
  - 🌍 **Export** — "Facturation EUR/USD, SWIFT, crédit documentaire"
  - 🏛 **Institutionnel** — "Contrat cadre, bon de commande officiel requis"
- Card active : `border-2 border-primary bg-primary/5`
- Card hover : `border-border bg-accent/30`

Section "Instructions spéciales" :
- `Textarea` — `rounded-lg border-input`, placeholder "Instructions de livraison, référence acheteur..."

Bouton "Continuer vers paiement" — `variant="default" w-full`

#### Étape 2 — Paiement (selon canal sélectionné)

Canal National — options :
- Card "Virement bancaire" : icône `Landmark`, instructions RIB
- Card "BaridiMob" : icône mobile, instructions code

Canal Export — options :
- Card "Virement SWIFT" : icône `Globe`, champs SWIFT/IBAN
- Card "Crédit documentaire (L/C)" : icône `FileCheck`, instructions L/C

Canal Institutionnel :
- Upload "Bon de commande officiel" — zone drag-and-drop `border-2 border-dashed border-border rounded-xl`
- Référence contrat cadre — `Input font-mono`

Tous les inputs : `rounded-lg border-input bg-background`

#### Étape 3 — Confirmation

- `bg-chart-1/10 border border-chart-1/30 rounded-xl p-8 text-center`
- Icône `CheckCircle` 56px `text-chart-1` + animation `animate-bounce` (1 fois)
- "Commande confirmée !" — `font-sans font-bold text-2xl`
- "Numéro de commande : " + code en `font-mono font-bold text-primary`
- "Vous recevrez un email de confirmation à [adresse]"
- 2 boutons : "Suivre ma commande" → `/orders/[id]` et "Continuer mes achats" → `/catalog`

#### Panneau récap commande (sticky droite)

- `bg-card border border-border rounded-xl shadow-sm`
- Titre "Votre commande"
- Mini liste des items avec quantité et prix `font-mono`
- Totaux
- Mise à jour en temps réel selon le canal (devise change)

---

### 4.6 Page Liste des Commandes — `/orders`

**But :** Vue de toutes les commandes passées et en cours, avec statut et accès rapide au suivi.

#### Header de page
- "Mes Commandes" — `font-semibold text-2xl`
- Filtres : `Select` par statut (Toutes, En cours, Livrées, Annulées) + Input de recherche par numéro

#### Tableau/Liste des commandes

**En desktop : tableau `Table` shadcn**

Colonnes :
| Colonne | Format |
|---|---|
| N° Commande | `font-mono text-primary` cliquable |
| Date | `font-mono text-sm text-muted-foreground` |
| Produit(s) | Nom tronqué + badge "+X autres" si plusieurs |
| Quantité totale | `font-mono font-medium` (ex: `1 200 kg`) |
| Montant total | `font-mono font-bold` |
| Canal | Badge canal (National/Export/Institutionnel) |
| Statut | OrderStatusBadge |
| Actions | Boutons "Voir" + "Télécharger" |

**OrderStatusBadge :**
- En attente confirmation : `bg-muted text-muted-foreground` + icône `Clock`
- Confirmée : `bg-chart-2/15 text-chart-2` + icône `CheckCircle`
- En préparation : `bg-chart-3/15 text-chart-3` + icône `Package`
- Expédiée : `bg-chart-4/15 text-chart-4` + icône `Truck`
- Livrée : `bg-chart-1/15 text-chart-1` + icône `PackageCheck`
- Annulée : `bg-destructive/15 text-destructive` + icône `XCircle`
- Litige : `bg-destructive/15 text-destructive` + icône `AlertTriangle`

Tous les badges : `rounded-sm font-mono text-xs font-semibold px-2 py-1`

**En mobile : OrderCard**
- `bg-card border border-border rounded-xl p-4`
- Header : N° commande `font-mono text-primary` + statut badge à droite
- Body : produit, quantité `font-mono`, montant `font-mono font-bold`
- Footer : date + bouton "Voir détail"

---

### 4.7 Page Détail Commande — `/orders/[orderId]`

**But :** Vue complète d'une commande : infos, statut, tracking en temps réel, documents associés.

#### Header commande
- "Commande" + code `font-mono font-bold text-xl text-primary`
- Badge statut (grand)
- Date de commande en `font-mono text-muted-foreground`
- Boutons : "Télécharger la facture" (icône `FileDown`) + "Soumettre une réclamation" (icône `AlertCircle`, `variant="outline"`)

#### Timeline de commande — `OrderTimeline`

Timeline horizontale sur desktop (verticale sur mobile) avec les étapes :
1. **Commande placée** — date heure `font-mono text-xs`
2. **Confirmation vendeur** — date heure ou "En attente"
3. **En préparation** — date ou "—"
4. **Expédiée** — date + lien tracking
5. **Livrée** — date ou "—"

Chaque étape : cercle + label + date sous. Étapes passées en `text-chart-1`, active `text-primary` avec animation `animate-pulse`, futures en `text-muted-foreground`.

#### ShipmentTracker

- `bg-card border border-border rounded-xl p-6`
- Titre "Suivi d'expédition" + badge statut
- N° tracking : `font-mono font-bold text-primary` + bouton copier
- Transporteur, ETA : date en `font-mono`
- Mini-timeline de livraison (3-4 points : départ entrepôt → en transit → arrivée région → livré)
- Carte simulée (SVG rectangle stylisé de l'Algérie avec point d'origine et destination)
- Température si lot C2 (cold chain) : affichée en `font-mono` avec icône `Thermometer`

#### Articles commandés

Tableau simple :
- Code produit `font-mono`
- Désignation
- Grade badge
- Quantité `font-mono`
- Prix unitaire `font-mono`
- Total ligne `font-mono font-bold`

#### Documents liés

Grille 2×2 de DocumentCard :
- Facture
- Certificat NFN (bouton "Vérifier")
- Documents d'export (si canal export)
- Bon de livraison

#### Infos livraison + paiement (2 colonnes)

- Adresse de livraison — `bg-muted rounded-xl p-4`
- Mode de paiement — `bg-muted rounded-xl p-4`

---

### 4.8 Page Documents — `/documents`

**But :** Centraliser tous les documents téléchargeables liés aux commandes de l'acheteur.

#### Header + Filtres

- Titre "Mes Documents"
- Filtres : Type (Tous, Factures, Certificats NFN, Documents export, Bons de livraison), Période (Select), Recherche par N° commande

#### Grille de documents

**DocumentCard** — `bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow` :
- Icône de type document (colorée selon type) — `rounded-lg p-3 bg-muted` à gauche
  - Facture : icône `Receipt` `text-chart-2`
  - Certificat NFN : icône `ShieldCheck` `text-chart-1`
  - Export : icône `Globe` `text-chart-3`
  - BL : icône `Truck` `text-chart-4`
- Type document en `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
- Référence commande en `font-mono text-sm text-primary`
- Date en `font-mono text-xs text-muted-foreground`
- Taille fichier en `font-mono text-xs text-muted-foreground`
- Boutons : "Aperçu" (icône `Eye`) et "Télécharger" (icône `Download`) — `variant="ghost" size="sm"`

#### DocumentPreviewModal

- Sheet shadcn full-height depuis la droite
- Titre du document
- Iframe ou rendu PDF simulé (cadre `bg-muted rounded-xl aspect-[210/297]`)
- Bouton "Télécharger" et "Fermer"

---

### 4.9 Page Réclamations — `/complaints`

#### Vue liste `/complaints/page.tsx`

Header :
- "Mes Réclamations"
- Bouton "Nouvelle réclamation" — `variant="default"` icône `Plus`

Tableau des réclamations :
- N° réclamation `font-mono text-primary`
- N° commande associée `font-mono`
- Type (Qualité, Quantité, Livraison, Autre)
- Date soumission `font-mono text-muted-foreground`
- Statut : En cours d'examen / Résolue / Rejetée (badges colorés)
- Bouton "Voir détail"

État vide : illustration + "Aucune réclamation — c'est bon signe !"

#### Formulaire nouvelle réclamation `/complaints/new/page.tsx`

Layout centré, max-width 720px

Étapes visuelles (steps 1-3) :

**Étape 1 — Identification**
- `Select` "Commande concernée" — affiche N° commande + date `font-mono` dans les options
- Après sélection : résumé de la commande en `bg-muted rounded-xl p-4`
- `Select` "Type de réclamation" : Défaut qualité / Écart de quantité / Problème de livraison / Certificat / Autre

**Étape 2 — Description**
- `Textarea` "Décrivez le problème en détail" — min 5 lignes, `rounded-lg`
- Zone upload photos/preuves — drag-and-drop `border-2 border-dashed border-border rounded-xl`, accept images + PDF
- Fichiers uploadés affichés en chips avec icône de type et bouton supprimer
- `Input` "Montant du préjudice estimé (optionnel)" — `font-mono`

**Étape 3 — Résolution souhaitée**
- Radio cards : "Remplacement produit" / "Avoir commercial" / "Remboursement" / "Autre"
- `Textarea` "Précisions additionnelles" — optionnel
- Case à cocher : "J'accepte que cette réclamation soit transmise aux équipes NFN pour investigation"
- Bouton "Soumettre la réclamation" — `variant="default" w-full`

**Confirmation :**
- `bg-chart-1/10 border border-chart-1/30 rounded-xl p-8 text-center`
- N° réclamation généré en `font-mono font-bold`
- "Délai de traitement estimé : 5 jours ouvrables"

---

### 4.10 Pages Compte — `/account/*`

#### Profil — `/account/page.tsx`

Layout 2 colonnes (5/7)

**Colonne gauche — Carte entreprise :**
- `bg-card border border-border rounded-xl p-6`
- Avatar entreprise : carré 96px `rounded-xl bg-primary/10 flex items-center justify-center` avec initiales `font-serif font-bold text-3xl text-primary`
- Bouton "Changer le logo" — `variant="ghost" size="sm"`
- Nom entreprise — `font-sans font-bold text-xl`
- Type : badge (Industrie textile / Coopérative agricole / Exportateur / Autre) — `rounded-sm`
- Statut compte : badge "Vérifié" `bg-chart-1/15 text-chart-1` ou "En attente vérification"
- Canal principal (National / Export / Institutionnel)
- Membre depuis : `font-mono text-xs text-muted-foreground`

**Stats rapides (4 cards en grille 2×2) :**
- Total commandé : valeur en `font-mono font-bold text-primary text-xl`
- Commandes complètes
- Documents disponibles
- Réclamations ouvertes

**Colonne droite — Formulaire infos :**
- Champs : Nom entreprise, NIF/NUIS `font-mono`, Secteur d'activité, Site web
- Contact principal : prénom, nom, email, téléphone
- Chaque Input : `rounded-lg border-input`, label `text-sm font-medium text-foreground`
- Bouton "Enregistrer les modifications" — `variant="default"`

#### Adresses — `/account/addresses/page.tsx`

- Header + bouton "Ajouter une adresse"
- Grid de AddressCard :
  - `bg-card border border-border rounded-xl p-5`
  - Tag "Par défaut" si principale — `bg-primary/10 text-primary rounded-sm text-xs font-semibold`
  - Nom du site, adresse complète, wilaya
  - Instructions livraison : `text-muted-foreground text-sm italic`
  - Boutons : "Modifier" (icône `Edit`) / "Supprimer" (icône `Trash2` `text-destructive`) / "Définir par défaut"

Dialog d'ajout/modification :
- Form dans un `Dialog` shadcn `rounded-xl shadow-lg`
- Champs : Nom du site, Adresse ligne 1, Adresse ligne 2, Commune, Wilaya (Select), Code postal, Instructions
- Tous les inputs `rounded-lg`

#### Paramètres — `/account/settings/page.tsx`

Sections séparées par des titres et séparateurs :

**Sécurité :**
- Email (non modifiable, affiché `font-mono`)
- Bouton "Changer le mot de passe" → Dialog avec ancien mdp + nouveau + confirmation
- Authentification 2FA : Switch activé/désactivé + instructions

**Préférences :**
- Langue de l'interface : `Select` (Français / العربية / English)
- Devise d'affichage : `Select` (DZD / EUR / USD)
- Notifications email : Switches pour (Confirmations de commande / Expéditions / Nouvelles disponibilités / Offres commerciales)

**Données & confidentialité :**
- Bouton "Télécharger mes données" — `variant="outline"`
- Bouton "Demander la suppression du compte" — `variant="outline" text-destructive border-destructive hover:bg-destructive/10`
- Dialog de confirmation de suppression avec input "Tapez SUPPRIMER pour confirmer"

---

## 5. Pages d'Authentification — `app/(auth)/`

### 5.1 Layout Auth — centré, fond `bg-background`

- Colonne centrée max-w-md
- Logo "ba33" en `font-serif` + tagline
- Card `bg-card border border-border rounded-xl shadow-md p-8`

### 5.2 Page Login — `/login`

Contenu de la card :
- Titre "Connexion" — `font-sans font-bold text-2xl`
- Sous-titre "Portail Acheteur ba33" — `text-muted-foreground text-sm`
- Séparateur

Form :
- Label "Email professionnel" — Input type email `rounded-lg`
- Label "Mot de passe" — Input type password `rounded-lg` avec bouton toggle visibilité (icône `Eye`/`EyeOff`)
- Ligne "Mot de passe oublié ?" — lien `text-primary text-sm`
- Bouton "Se connecter" — `variant="default" w-full`

Séparateur "ou" :
- Bouton "Connexion SSO (Enterprise)" — `variant="outline" w-full` icône `Building2`

Footer de la card :
- "Pas encore de compte ? " + lien "Créer un compte" → `/register`

### 5.3 Page Register — `/register`

Steps (1. Compte → 2. Entreprise → 3. Vérification) — identique aux steps de checkout

Step 1 : Email + mot de passe + confirmation
Step 2 : Nom entreprise, NIF/NUIS, secteur, canal principal, téléphone
Step 3 : "Email de vérification envoyé à [email]" + bouton "Renvoyer"

### 5.4 Page OTP — `/verify-otp`

- 6 cases `Input` individuelles pour le code OTP, auto-focus chaîné
- Police `font-mono font-bold text-2xl text-center` dans chaque case
- Timer de renvoi countdown en `font-mono text-sm text-muted-foreground`

---

## 6. Composants Réutilisables — Spécifications

### LotIdChip
```tsx
// Affiche un lot ID cliquable
<span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-sm border border-primary/20 hover:bg-primary/20 cursor-pointer">
  L-00042-X7
</span>
```

### WeightDisplay
```tsx
// Affiche un poids formaté avec unité
<span>
  <span className="font-mono font-semibold text-foreground">1 240</span>
  <span className="font-mono text-xs text-muted-foreground ml-1">kg</span>
</span>
```

### GradeBadge
```tsx
// Grade A/B/C en badge coloré
// A → chart-1, B → chart-2, C → chart-3
<span className="font-mono font-bold text-xs px-2 py-0.5 rounded-sm border bg-chart-1/15 text-chart-1 border-chart-1/30">
  Grade A
</span>
```

### NfnSealBadge
```tsx
// Sceau NFN certifié
<span className="flex items-center gap-1 font-sans text-xs font-semibold px-2 py-0.5 rounded-sm border bg-chart-1/20 text-chart-1 border-chart-1/40">
  <ShieldCheck className="w-3 h-3" />
  NFN Certifié
</span>
```

### LanguageSwitcher
- Dropdown avec drapeaux : 🇫🇷 Français / 🇸🇦 العربية / 🇬🇧 English
- Changement de langue change l'attribut `dir` sur `<html>` (rtl pour arabe)
- Utiliser `next-intl` ou solution i18n compatible App Router

---

## 7. UX — Règles d'Interaction

### États de chargement
- Chaque section qui charge : `Skeleton` shadcn — `rounded-lg bg-muted animate-pulse`
- Ne jamais bloquer toute la page — charger section par section
- Skeleton ProductCard : rectangle 240px + 3 lignes de texte + 2 boutons

### Toasts / Notifications
- `Toaster` shadcn dans le root layout
- Succès : `variant="default"` avec icône `CheckCircle` `text-chart-1`
- Erreur : `variant="destructive"`
- Info : `variant="default"` avec icône `Info`
- Position : `bottom-right` sur desktop, `bottom-center` sur mobile

### Confirmations destructives
- Toujours via `AlertDialog` shadcn — jamais `confirm()` natif
- Bouton de confirmation : `variant="destructive"`
- Titre explicite, description des conséquences

### Formulaires
- Validation en temps réel (sur `onBlur`) — messages d'erreur sous les inputs en `text-destructive text-xs`
- Bouton de soumission désactivé + icône spinner `Loader2 animate-spin` pendant la requête
- Succès : toast + redirect ou mise à jour locale

### Accessibilité obligatoire
- Tous les boutons ont un `aria-label` si icône seule
- Focus visible sur tous les éléments interactifs (le `ring` du design system)
- Contraste minimum 4.5:1 sur tout texte
- Navigation clavier complète (Tab, Enter, Escape pour fermer les dialogs)
- Attributs `dir="rtl"` sur `<html>` en mode arabe

### Animations
- Transitions de pages : `opacity-0 → opacity-100` en 150ms
- Cards au hover : `transition-shadow duration-200`
- Dialogs : `animate-in fade-in slide-in-from-bottom-4` shadcn natif
- Progress bars : `transition-all duration-500`
- Pas d'animation excessive — sobre et professionnel

---

## 8. Données Mock — Structure TypeScript

Utiliser des données mock réalistes pour toutes les pages. Voici les types minimum :

```typescript
// lib/types/product.ts
type ProductGrade = 'A' | 'B' | 'C'
type ProductType = 'P1' | 'P2'
type SourceType = 'C1' | 'C2' | 'C3'
type NfnSealStatus = 'certified' | 'revoked' | 'pending'

interface Product {
  id: string                    // "P1-00042-X7"
  code: string                  // font-mono partout
  name: string
  type: ProductType
  grade: ProductGrade
  region: string               // Wilaya (ex: "Tiaret")
  availableQuantityKg: number
  pricePerKgDzd: number
  pricePerKgEur?: number
  nfnSealStatus: NfnSealStatus
  nfnSealCode?: string
  nfnCertifiedAt?: Date
  description: string
  images: string[]
  qualityParameters: QualityParameters
  traceability: TraceabilityChain
  createdAt: Date
}

interface QualityParameters {
  fiberLengthMm: number
  fiberDiameterMicrons: number
  moisturePercent: number
  washingYieldR1Percent: number  // font-mono avec barre progress
  cleanlinessScore: number       // 1-5
  colorDescription: string
}

// lib/types/traceability.ts
interface TraceabilityChain {
  collectionEvent: CollectionEvent
  depotD1Event: DepotEvent
  transportEvent: TransportEvent
  laverieD2Event: LaverieEvent
  transformationEvent: TransformationEvent
  certificationEvent: CertificationEvent
}

// lib/types/order.ts
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'disputed'
type SalesChannel = 'national' | 'export' | 'institutional'

interface Order {
  id: string                  // "CMD-2024-00142"
  items: OrderItem[]
  status: OrderStatus
  channel: SalesChannel
  totalAmountDzd: number
  totalQuantityKg: number
  placedAt: Date
  estimatedDelivery?: Date
  deliveredAt?: Date
  shippingAddress: Address
  trackingNumber?: string
  documents: OrderDocument[]
}
```

---

## 9. Structure de Navigation — Routes Complètes

```
/login                            ← (auth) group
/register
/verify-otp

/catalog                          ← (buyer) group — layout avec sidebar
/catalog?type=P1&grade=A&region=Tiaret  ← filtres en searchParams
/catalog/[productId]
/verify
/verify?code=NFN-P1-00042-X7      ← code pré-rempli depuis QR
/cart
/checkout
/orders
/orders?status=shipped            ← filtre par statut
/orders/[orderId]
/documents
/documents?type=certificate       ← filtre par type
/complaints
/complaints/new
/complaints/new?orderId=CMD-2024-00142  ← commande pré-sélectionnée
/account
/account/addresses
/account/settings
```

---

## 10. Règles de Code

1. **TypeScript strict** — `strict: true` dans `tsconfig.json`, aucun `any` sans commentaire
2. **Nommage des fichiers** — kebab-case : `product-card.tsx`, `order-status-badge.tsx`
3. **Nommage des composants** — PascalCase : `ProductCard`, `OrderStatusBadge`
4. **Organisation par feature** — `components/buyer/{feature}/` jamais de `components/shared/Button` (utiliser shadcn)
5. **Pas de `useState` pour de l'état complexe** — `useReducer` ou Zustand si l'état dépasse 3 propriétés
6. **Server Components par défaut** — ajouter `"use client"` seulement si nécessaire (hooks, events)
7. **Les données passent via props** — pas de Context sauf pour auth et thème
8. **Pas de `TODO` sans référence** — `// TODO(BA33-XXX): ...`
9. **Pas de code commenté** — delete it, git remembers
10. **Chaque composant a son propre fichier** — jamais 2 composants exports dans un seul fichier
