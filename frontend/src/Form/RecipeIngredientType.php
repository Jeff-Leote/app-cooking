<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;
use App\Form\DataTransformer\QuantityDataTransformer;

class RecipeIngredientType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('ingredient_id', TextType::class, [
                'label' => 'Ingrédient',
                'required' => true,
                'attr' => [
                    'class' => 'ingredient-search-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                    'placeholder' => 'Rechercher un ingrédient...',
                    'autocomplete' => 'off',
                    'data-ingredient-id' => '',
                ],
                'constraints' => [
                    new Assert\NotBlank(['message' => 'L\'ingrédient est obligatoire']),
                ],
            ])
            ->add('quantite', NumberType::class, [
                'label' => 'Quantité',
                'required' => false,
                'scale' => 2, // Permet jusqu'à 2 décimales
                'attr' => [
                    'class' => 'quantity-input w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                    'placeholder' => 'Ex: 200',
                    'step' => '0.01',
                    'min' => '0',
                    'inputmode' => 'decimal',
                ],
                'constraints' => [
                    new Assert\Type(['type' => 'numeric', 'message' => 'La quantité doit être un nombre']),
                    new Assert\GreaterThanOrEqual(['value' => 0, 'message' => 'La quantité doit être positive ou nulle']),
                ],
            ])
            ->add('unite', ChoiceType::class, [
                'label' => 'Unité',
                'required' => false,
                'choices' => [
                    'g' => 'g',
                    'kg' => 'kg',
                    'cl' => 'cl',
                    'dl' => 'dl',
                    'l' => 'l',
                    'pièces' => 'pièces',
                    'cuillères à soupe' => 'cuillères à soupe',
                    'cuillères à café' => 'cuillères à café',
                    'pincées' => 'pincées',
                ],
                'placeholder' => 'Unité',
                'attr' => [
                    'class' => 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                ],
            ]);
        
        // Ajouter le transformer pour convertir "200 g" -> 200
        $builder->get('quantite')->addModelTransformer(new QuantityDataTransformer());
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'ingredients' => [],
            'csrf_protection' => false, // Désactivé car c'est un sous-formulaire
        ]);
    }
}
