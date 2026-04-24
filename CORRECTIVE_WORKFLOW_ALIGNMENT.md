# Corrective Workflow Alignment - Filiere Laine

## 1. Objectif

Ce document corrige l'alignement fonctionnel du projet ba33 avec le cahier de charge reel de la filiere laine.

Le projet doit rester centre sur une plateforme numerique centrale qui couvre le flux complet :

```txt
collecte -> identification lot -> estimation/pesee -> entree systeme -> suivi des ecarts -> depot -> lavage -> transformation -> commercialisation
```

Le point critique du cahier de charge est la collecte. Le transporteur est necessaire pour la continuite logistique, mais il ne doit pas devenir le coeur fonctionnel du projet.

## 2. Diagnostic

Le projet actuel n'est pas hors contexte. Il couvre bien la chaine laine, la tracabilite, les lots, les pesees et les ecarts.

Cependant, certains documents et choix dans `.claude/` depassent le cahier de charge ou doivent etre corriges :

- Le scope `.claude/` est plus large que le cahier : certification NFN avancee, portail institutionnel, WhatsApp, SMS/USSD, cold-chain, A1 alerts.
- Le cahier demande une couverture globale, mais sans forcement detailler tous les modules industriels.
- Le cahier insiste surtout sur la collecte comme point d'entree critique.
- Le backend plan mentionne encore `email + password`, alors que la decision projet est `phone + password`.
- Les apps mobiles ont des morceaux du workflow, mais le flux complet n'est pas encore connecte au backend.

Conclusion : le projet est dans le bon contexte, mais il doit etre recentre sur le workflow minimum demande par le cahier.

## 3. Corrections Fonctionnelles

Les corrections suivantes doivent etre appliquees au plan produit et au backend :

- Utiliser `phone + password` pour l'auth mobile.
- Ne pas utiliser OTP.
- Ne pas utiliser BetterAuth.
- Ne pas utiliser bcrypt.
- Utiliser Argon2id pour le hash des passwords.
- Rendre `email` optionnel dans `users`.
- Rendre `phone` obligatoire et unique dans `users`.
- Garder `transporteur` comme module support logistique.
- Remettre la collecte au centre du MVP.
- Distinguer clairement poids estime, poids declare, poids collecte/reel, poids recu, poids lave, poids transforme et poids vendu.

## 4. Workflow Cible Demande Par Le Cahier

Le workflow cible doit etre le suivant.

1. Le berger ou la source declare une disponibilite de laine.
2. Le systeme cree une pre-declaration avec estimation de quantite, localisation, date et notes.
3. Le collecteur voit les demandes de collecte dans sa zone.
4. Le collecteur planifie ou accepte une collecte.
5. Sur le terrain, le collecteur constate la matiere, son etat et son poids reel.
6. Le collecteur cree un lot officiel dans le systeme.
7. Le lot recoit un identifiant unique et un QR code.
8. Le backend compare poids estime et poids collecte.
9. Le lot est transporte vers un depot intermediaire.
10. Le depot receptionne, scanne et pese le lot.
11. Le backend compare poids collecte et poids recu au depot.
12. Le lot est stocke de maniere organisee.
13. Le lot est envoye au lavage.
14. Le lavage pese en entree et en sortie.
15. Le backend compare poids recu et poids lave.
16. Le lot lave est oriente vers la transformation.
17. La transformation pese les entrees et les sorties.
18. Le backend compare poids lave et poids transforme.
19. Les produits transformes sont mis en vente.
20. Le backend conserve la tracabilite jusqu'a la commercialisation.

## 5. Donnees De Poids A Conserver

Pour respecter le cahier de charge, chaque phase doit conserver ses entrees, ses sorties et ses ecarts.

| Phase | Entree attendue | Sortie attendue | Controle |
|---|---|---|---|
| Declaration | Quantite estimee | Pre-lot cree | Estimation initiale |
| Collecte | Quantite estimee | Poids collecte reel | Ecart estime vs collecte |
| Depot | Poids collecte | Poids recu depot | Ecart collecte vs depot |
| Lavage | Poids sale entrant | Poids propre sortant | Rendement lavage |
| Transformation | Poids lave entrant | Poids produit sortant | Rendement transformation |
| Vente | Stock produit | Quantite vendue | Ecart stock vs vente |

Ces donnees doivent alimenter un historique append-only via les events.

## 6. Changements Backend Necessaires

### Auth

- Corriger `users` pour utiliser `phone` comme identifiant principal.
- Garder `password_hash`, mais avec Argon2id.
- Garder `email` nullable.
- Implementer `POST /auth/login` avec `phone + password`.
- Implementer `POST /auth/refresh`.
- Implementer `POST /auth/logout`.
- Implementer `GET /users/me`.
- Verifier `userType` selon l'application mobile.

### Collection

- Implementer `GET /collection/pre-lots`.
- Implementer `POST /collection/pre-lots` pour les declarations berger/source.
- Implementer `PATCH /collection/pre-lots/:id/schedule`.
- Implementer `POST /collection/lots` pour transformer une declaration en lot officiel.
- Generer ou accepter un `lotId` offline.
- Generer un `qrCode` unique.
- Enregistrer le poids collecte reel.
- Enregistrer l'etat rapide de la laine.
- Enregistrer source, GPS, notes, photo et signature si disponibles.

### Lots

- Implementer `GET /lots/:id`.
- Implementer `GET /lots/qr/:qrCode`.
- Implementer historique du lot via events.
- Distinguer dans la reponse : `estimatedWeightKg`, `declaredWeightKg`, `actualWeightKg`.

### Weighs And Reconciliation

- Utiliser `lot_weighs` pour chaque pesee importante.
- Creer une reconciliation a chaque passage de phase.
- Calculer `deltaKg`.
- Calculer `deltaPercent`.
- Comparer avec une tolerance configurable.
- Marquer les ecarts depassant la tolerance.

### Depot

- Implementer `POST /depots/:id/receive`.
- Scanner le QR du lot.
- Enregistrer poids recu au depot.
- Comparer poids collecte vs poids recu.
- Creer reception depot.
- Mettre a jour statut lot `received_depot`.

### Lavage

- Implementer reception lavage.
- Enregistrer poids sale entrant.
- Enregistrer poids propre sortant.
- Calculer rendement lavage.
- Mettre a jour statut lot.

### Transformation

- Enregistrer entrees lots laves.
- Enregistrer sorties produits.
- Calculer rendement transformation.
- Lier produits aux lots d'origine.

### Commercialisation

- Exposer produits transformes disponibles.
- Creer ventes simples.
- Conserver lien produit -> transformation -> lot -> source.

### Transporteur

Le module transporteur reste necessaire, mais comme support de circulation entre phases.

Endpoints minimum :

```txt
GET /transport/jobs
GET /transport/jobs/:id
POST /transport/jobs/:id/accept
POST /transport/jobs/:id/weigh-in
POST /transport/jobs/:id/start
POST /transport/jobs/:id/weigh-out
POST /transport/jobs/:id/complete
```

GPS, temperature, A1 alerts et sync avancee peuvent rester dans le scope v1 si le temps le permet, mais ils ne remplacent pas le coeur collecte.

## 7. Changements Mobile Collector Necessaires

`mobile-collector` doit devenir l'application prioritaire pour matcher le cahier.

A ajouter ou completer :

- Charger les pre-declarations depuis le backend.
- Afficher les demandes de collecte par zone.
- Planifier ou accepter une collecte.
- Selectionner source reelle C1/C2/C3.
- Capturer GPS reel.
- Capturer photo terrain.
- Saisir ou lire poids via balance.
- Saisir etat de la laine.
- Creer lot officiel.
- Generer QR code.
- Imprimer ou afficher QR code.
- Stocker en Drift offline.
- Ajouter sync offline.
- Envoyer events au backend.
- Afficher ecart entre poids estime et poids collecte.

Le modele mobile `Lot` doit evoluer pour separer :

```txt
estimatedWeightKg
declaredWeightKg
actualWeightKg
qrCode
sourceId
preLotId
```

## 8. Changements Mobile Shepherd Necessaires

`mobile-shepherd` contient deja la logique d'estimation, mais elle doit etre connectee au backend.

A ajouter ou completer :

- Envoyer la declaration au backend.
- Convertir les categories visuelles en fourchettes de poids.
- Permettre un poids custom.
- Envoyer localisation GPS.
- Envoyer photo optionnelle.
- Afficher statut de pickup.
- Afficher recu apres collecte.
- Afficher poids final collecte et estimation de prix si disponible.

Conversion recommandee :

| Categorie | Estimation |
|---|---:|
| `oneSheep` | 3 kg |
| `oneBag` | 5 kg |
| `smallPile` | 15 kg |
| `largePile` | 50 kg |
| `custom` | valeur saisie |

## 9. Changements Mobile Transporter Necessaires

`mobile-transporter` contient deja la logique de scan, pesee et ecarts pour le transport.

A ajouter ou completer :

- Brancher auth backend `phone + password`.
- Charger jobs depuis backend.
- Remplacer les mocks par API reelle.
- Envoyer weigh-in au backend.
- Envoyer weigh-out au backend.
- Envoyer signature/preuve de livraison.
- Garder sync offline via queue Drift.
- Garder detection ecart > 2%.

Le transporteur ne doit pas etre presente comme coeur du cahier, mais comme mecanisme de continuite entre collecte, depot et lavage.

## 10. Backend MVP Prioritaire

L'ordre recommande pour matcher exactement le cahier :

1. Auth `phone + password`.
2. Users et roles.
3. Sources C1/C2/C3.
4. Declarations/pre-lots.
5. Creation lot collecteur.
6. QR code lot.
7. Pesee collecte.
8. Reconciliation estimation vs collecte.
9. Depot reception.
10. Reconciliation collecte vs depot.
11. Transport jobs minimum.
12. Lavage reception et rendement.
13. Transformation simple.
14. Commercialisation simple.
15. Dashboard ou endpoints de suivi global.

## 11. MVP Technique Minimal

Pour une demo coherente avec le cahier, il faut montrer ce parcours :

```txt
berger declare 15 kg
collecteur recoit la demande
collecteur pese 18 kg
backend cree lot QR
backend signale ecart +3 kg entre estime et collecte
transporteur livre au depot
depot pese 17.5 kg
backend signale ecart -0.5 kg entre collecte et depot
lot continue vers lavage
```

Ce scenario prouve :

- collecte structuree,
- identification lot,
- estimation terrain,
- pesee reelle,
- entree dans le systeme,
- suivi des ecarts,
- continuite entre etapes.

## 12. Ce Qui Peut Rester En Extension

Les elements suivants sont utiles mais non obligatoires pour matcher exactement le cahier :

- BetterAuth.
- OTP.
- SMS/USSD.
- WhatsApp bot.
- Portail institutionnel.
- Certification NFN avancee.
- Cold-chain C2 avancee.
- A1 alerts avancees.
- Buyer portal complet.
- Paiement.
- Export documents.

Ces sujets peuvent rester dans `.claude/` comme vision long terme, mais le MVP doit d'abord prouver la tracabilite matiere.

## 13. Conclusion

Le projet ba33 est dans le bon contexte, mais il doit etre recentre pour matcher exactement le cahier de charge.

La priorite n'est pas seulement de faire fonctionner le transporteur. La priorite est de prouver le workflow :

```txt
collecte -> lot -> QR -> pesees -> ecarts -> phases suivantes -> tracabilite
```

Le transporteur doit etre implemente comme support de cette chaine, pas comme finalite principale.
