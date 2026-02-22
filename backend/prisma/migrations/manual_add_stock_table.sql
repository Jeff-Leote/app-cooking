-- Migration manuelle pour ajouter la table Stock
-- À exécuter dans la base de données PostgreSQL

-- Créer la table stock
CREATE TABLE IF NOT EXISTS "stock" (
    "id" SERIAL NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantite" VARCHAR(100),
    "date_ajout" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "date_peremption" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- Créer la contrainte unique sur ingredient_id
CREATE UNIQUE INDEX IF NOT EXISTS "uq_stock_ingredient" ON "stock"("ingredient_id");

-- Créer l'index sur ingredient_id
CREATE INDEX IF NOT EXISTS "idx_stock_ingredient" ON "stock"("ingredient_id");

-- Ajouter la clé étrangère vers ingredients
ALTER TABLE "stock" ADD CONSTRAINT "stock_ingredient_id_fkey" 
    FOREIGN KEY ("ingredient_id") 
    REFERENCES "ingredients"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- Commentaires
COMMENT ON TABLE "stock" IS 'Stock des ingrédients disponibles dans les placards';
COMMENT ON COLUMN "stock"."ingredient_id" IS 'Référence à l''ingrédient';
COMMENT ON COLUMN "stock"."quantite" IS 'Quantité disponible (ex: 500g, 1L, 3 pièces)';
COMMENT ON COLUMN "stock"."date_ajout" IS 'Date d''ajout au stock';
COMMENT ON COLUMN "stock"."date_peremption" IS 'Date de péremption (optionnel)';
