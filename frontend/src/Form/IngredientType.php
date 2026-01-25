<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
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
            ->add('sans_lactose', CheckboxType::class, [
                'label' => 'Sans lactose',
                'required' => false,
                'attr' => [
                    'class' => 'w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green',
                ],
            ])
            ->add('sans_gluten', CheckboxType::class, [
                'label' => 'Sans gluten',
                'required' => false,
                'attr' => [
                    'class' => 'w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green',
                ],
            ])
            ->add('riche_proteines', CheckboxType::class, [
                'label' => 'Riche en protéines',
                'required' => false,
                'attr' => [
                    'class' => 'w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green',
                ],
            ])
            ->add('riche_fibres', CheckboxType::class, [
                'label' => 'Riche en fibres',
                'required' => false,
                'attr' => [
                    'class' => 'w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green',
                ],
            ])
            ->add('riche_vitamines', CheckboxType::class, [
                'label' => 'Riche en vitamines',
                'required' => false,
                'attr' => [
                    'class' => 'w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green',
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
