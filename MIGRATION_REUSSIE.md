# ✅ Migration de la table Stock - RÉUSSIE

## Statut
La table `stock` a été créée avec succès dans la base de données PostgreSQL.

## Détails de la migration

### Table créée
- **Nom** : `stock`
- **Colonnes** :
  - `id` (SERIAL, PRIMARY KEY)
  - `ingredient_id` (INTEGER, NOT NULL, FOREIGN KEY vers `ingredients`)
  - `quantite` (VARCHAR(100), nullable)
  - `date_ajout` (TIMESTAMP, default CURRENT_TIMESTAMP)
  - `date_peremption` (DATE, nullable)
  - `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP)

### Index créés
- `stock_pkey` : PRIMARY KEY sur `id`
- `uq_stock_ingredient` : UNIQUE sur `ingredient_id`
- `idx_stock_ingredient` : INDEX sur `ingredient_id`

### Contraintes
- Foreign key : `ingredient_id` → `ingredients(id)` avec CASCADE

### Client Prisma
- ✅ Client Prisma régénéré avec succès

## Prochaines étapes

1. ✅ Migration exécutée
2. ✅ Client Prisma régénéré
3. ✅ Backend redémarré

## Test

Pour vérifier que tout fonctionne :

1. Accéder à la page Stock : `http://localhost:8000/stock`
2. Tester l'ajout d'un ingrédient au stock
3. Vérifier que les repas passés retirent automatiquement le stock

## Commandes utiles

Vérifier la structure de la table :
```bash
docker exec app-cooking-postgres psql -U cooking_user -d cooking_app -c "\d stock"
```

Voir le contenu de la table :
```bash
docker exec app-cooking-postgres psql -U cooking_user -d cooking_app -c "SELECT * FROM stock;"
```
