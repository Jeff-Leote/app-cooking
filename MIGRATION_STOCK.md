# Migration de la table Stock

## Instructions pour ajouter la table Stock à la base de données

### Option 1 : Via Prisma (recommandé)

Une fois Docker démarré et la base de données accessible :

```bash
cd backend
npx prisma migrate dev --name add_stock_table
```

### Option 2 : Via SQL manuel

Si Prisma ne fonctionne pas, exécutez le fichier SQL manuellement :

```bash
# Se connecter à PostgreSQL via Docker
docker exec -i app-cooking-postgres psql -U postgres -d postgres < backend/prisma/migrations/manual_add_stock_table.sql
```

Ou via pgAdmin :
1. Ouvrir pgAdmin
2. Se connecter à la base de données
3. Exécuter le contenu du fichier `backend/prisma/migrations/manual_add_stock_table.sql`

## Vérification

Après la migration, vérifiez que la table existe :

```sql
SELECT * FROM stock LIMIT 1;
```

Si la table existe, la migration est réussie !
