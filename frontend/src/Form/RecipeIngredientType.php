<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class RecipeIngredientType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $ingredients = $options['ingredients'] ?? [];
        
        $builder
            ->add('ingredient_id', ChoiceType::class, [
                'label' => 'Ingrédient',
                'required' => true,
                'choices' => $this->formatIngredientsForChoice($ingredients),
                'placeholder' => 'Sélectionner un ingrédient',
                'choice_value' => function ($choice) {
                    return $choice;
                },
                'attr' => [
                    'class' => 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                ],
                'constraints' => [
                    new Assert\NotBlank(['message' => 'L\'ingrédient est obligatoire']),
                ],
            ])
            ->add('quantite', TextType::class, [
                'label' => 'Quantité',
                'required' => false,
                'attr' => [
                    'class' => 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                    'placeholder' => 'Ex: 200g, 2 cuillères, etc.',
                    'maxlength' => 100,
                ],
                'constraints' => [
                    new Assert\Length([
                        'max' => 100,
                        'maxMessage' => 'La quantité ne peut pas dépasser {{ limit }} caractères',
                    ]),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'ingredients' => [],
            'csrf_protection' => false, // Désactivé car c'est un sous-formulaire
        ]);
    }

    /**
     * Formate les ingrédients pour le champ ChoiceType
     * @param array $ingredients
     * @return array
     */
    private function formatIngredientsForChoice(array $ingredients): array
    {
        $choices = [];
        foreach ($ingredients as $ingredient) {
            $label = $ingredient['nom'] ?? '';
            $choices[$label] = $ingredient['id'] ?? null;
        }
        return $choices;
    }
}
