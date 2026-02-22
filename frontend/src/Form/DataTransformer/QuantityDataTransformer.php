<?php

namespace App\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Exception\TransformationFailedException;

/**
 * Transforme la valeur de la base de données (ex: "200 g") en valeur pour le formulaire (200)
 * et vice versa
 */
class QuantityDataTransformer implements DataTransformerInterface
{
    /**
     * Transforme la valeur de la base de données vers le formulaire
     * "200 g" -> 200
     */
    public function transform($value): ?float
    {
        if (null === $value || '' === $value) {
            return null;
        }

        // Si c'est déjà un nombre, le retourner tel quel
        if (is_numeric($value)) {
            return (float) $value;
        }

        // Extraire le nombre de la chaîne (ex: "200 g" -> 200)
        if (preg_match('/^(\d+(?:\.\d+)?)/', (string) $value, $matches)) {
            return (float) $matches[1];
        }

        // Si on ne peut pas extraire un nombre, retourner null
        return null;
    }

    /**
     * Transforme la valeur du formulaire vers la base de données
     * 200 -> "200" (sera combiné avec l'unité dans le contrôleur)
     */
    public function reverseTransform($value): ?string
    {
        if (null === $value || '' === $value) {
            return null;
        }

        // Convertir en string pour être compatible avec le champ String de la base de données
        return (string) $value;
    }
}
