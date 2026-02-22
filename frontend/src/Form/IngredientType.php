<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class IngredientType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nom', TextType::class, [
                'label' => 'Nom de l\'ingrédient',
                'required' => true,
                'attr' => [
                    'class' => 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                    'placeholder' => 'Ex: Tomate, Farine, etc.',
                    'maxlength' => 255,
                ],
                'constraints' => [
                    new Assert\NotBlank(['message' => 'Le nom est obligatoire']),
                    new Assert\Length([
                        'max' => 255,
                        'maxMessage' => 'Le nom ne peut pas dépasser {{ limit }} caractères',
                    ]),
                ],
            ])
            ->add('categorie', ChoiceType::class, [
                'label' => 'Catégorie alimentaire',
                'required' => false,
                'placeholder' => '— Sélectionner —',
                'choices' => [
                    'Féculents' => 'FECULENTS',
                    'Protéines' => 'PROTEINES',
                    'Légumes' => 'LEGUMES',
                    'Fruits' => 'FRUITS',
                    'Produits laitiers' => 'PRODUITS_LAITIERS',
                    'Matières grasses' => 'MATIERES_GRASSES',
                    'Céréales' => 'CEREALES',
                    'Oléagineux' => 'OLEAGINEUX',
                    'Produits sucrés' => 'PRODUITS_SUCRES',
                    'Produits salés' => 'PRODUITS_SALES',
                    'Boissons' => 'BOISSONS',
                    'Épices et condiments' => 'EPICES_CONDIMENTS',
                ],
                'attr' => [
                    'class' => 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent',
                ],
            ])
            ->add('submit', SubmitType::class, [
                'label' => $options['is_edit'] ? 'Modifier l\'ingrédient' : 'Créer l\'ingrédient',
                'attr' => [
                    'class' => 'w-full bg-primary-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-green/90 transition-colors',
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'is_edit' => false,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'ingredient_form',
        ]);
    }
}
