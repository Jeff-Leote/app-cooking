<?php

namespace App\Controller;

use App\Form\RecipeType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class RecipesController extends AbstractController
{
    public function __construct(
        private readonly HttpClientInterface $httpClient
    ) {
    }
    
    private function getBackendUrl(): string
    {
        return $_ENV['APP_BACKEND_URL'] ?? $_SERVER['APP_BACKEND_URL'] ?? 'http://backend:3000';
    }

    #[Route('/recipes', name: 'app_recipes')]
    public function index(): Response
    {
        return $this->render('recipes/index.html.twig', [
            'page_title' => 'Mes Recettes',
        ]);
    }

    #[Route('/recipes/new', name: 'app_recipes_new')]
    public function new(Request $request): Response
    {
        // Charger les ingrédients depuis l'API
        $ingredients = $this->loadIngredients();
        
        $form = $this->createForm(RecipeType::class, null, [
            'is_edit' => false,
            'ingredients' => $ingredients,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            
            // Séparer les ingrédients des données de la recette
            $ingredients = $data['ingredients'] ?? [];
            unset($data['ingredients']);
            
            try {
                $backendUrl = $this->getBackendUrl();
                $response = $this->httpClient->request('POST', "{$backendUrl}/api/recipes", [
                    'json' => $data,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                    'timeout' => 30,
                ]);

                if ($response->getStatusCode() === 201) {
                    $recipe = $response->toArray();
                    $recipeId = $recipe['id'] ?? null;
                    
                    if ($recipeId && !empty($ingredients)) {
                        $this->addRecipeIngredients($recipeId, $ingredients);
                    }
                    
                    $this->addFlash('success', 'Recette créée avec succès !');
                    return $this->redirectToRoute('app_recipes');
                }
            } catch (\Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface $e) {
                $this->addFlash('error', 'Impossible de se connecter au backend. Vérifiez que le service backend est démarré.');
            } catch (\Exception $e) {
                $this->addFlash('error', 'Erreur lors de la création de la recette : ' . $e->getMessage());
            }
        }

        return $this->render('recipes/new.html.twig', [
            'page_title' => 'Créer une recette',
            'form' => $form,
        ]);
    }

    #[Route('/recipes/{id}/edit', name: 'app_recipes_edit')]
    public function edit(int $id, Request $request): Response
    {
        try {
            $backendUrl = $this->getBackendUrl();
            $response = $this->httpClient->request('GET', "{$backendUrl}/api/recipes/{$id}", [
                'timeout' => 30,
            ]);
            $recipe = $response->toArray();
        } catch (\Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface $e) {
            $this->addFlash('error', 'Impossible de se connecter au backend. Vérifiez que le service backend est démarré.');
            return $this->redirectToRoute('app_recipes');
        } catch (\Exception $e) {
            $this->addFlash('error', 'Recette introuvable');
            return $this->redirectToRoute('app_recipes');
        }

        // Charger les ingrédients depuis l'API
        $ingredients = $this->loadIngredients();
        
        // Formater les ingrédients de la recette pour le formulaire
        $recipeIngredients = [];
        if (isset($recipe['recipeIngredients']) && is_array($recipe['recipeIngredients'])) {
            foreach ($recipe['recipeIngredients'] as $ri) {
                $recipeIngredients[] = [
                    'ingredient_id' => $ri['ingredient']['id'] ?? $ri['ingredient_id'] ?? null,
                    'quantite' => $ri['quantite'] ?? '',
                ];
            }
        }
        $recipe['ingredients'] = $recipeIngredients;

        $form = $this->createForm(RecipeType::class, $recipe, [
            'is_edit' => true,
            'ingredients' => $ingredients,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            
            // Séparer les ingrédients des données de la recette
            $ingredients = $data['ingredients'] ?? [];
            unset($data['ingredients']);
            
            try {
                $backendUrl = $this->getBackendUrl();
                $response = $this->httpClient->request('PATCH', "{$backendUrl}/api/recipes/{$id}", [
                    'json' => $data,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                    'timeout' => 30,
                ]);

                if ($response->getStatusCode() === 200) {
                    $this->updateRecipeIngredients($id, $ingredients);
                    
                    $this->addFlash('success', 'Recette modifiée avec succès !');
                    return $this->redirectToRoute('app_recipes');
                }
            } catch (\Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface $e) {
                $this->addFlash('error', 'Impossible de se connecter au backend. Vérifiez que le service backend est démarré.');
            } catch (\Exception $e) {
                $this->addFlash('error', 'Erreur lors de la modification de la recette : ' . $e->getMessage());
            }
        }

        return $this->render('recipes/edit.html.twig', [
            'page_title' => 'Modifier la recette',
            'form' => $form,
            'recipe' => $recipe,
        ]);
    }
    
    /**
     * Charge les ingrédients depuis l'API
     */
    private function loadIngredients(): array
    {
        try {
            $backendUrl = $this->getBackendUrl();
            $response = $this->httpClient->request('GET', "{$backendUrl}/api/ingredients", [
                'timeout' => 30,
            ]);
            return $response->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }
    
    /**
     * Ajoute les ingrédients à une recette
     */
    private function addRecipeIngredients(int $recipeId, array $ingredients): void
    {
        // TODO: Implémenter l'ajout des ingrédients via l'API
        // Pour l'instant, on ne peut pas car l'API ne gère pas encore les ingrédients de recette
        // Il faudra créer un endpoint POST /api/recipes/{id}/ingredients
    }
    
    /**
     * Met à jour les ingrédients d'une recette
     */
    private function updateRecipeIngredients(int $recipeId, array $ingredients): void
    {
        // TODO: Implémenter la mise à jour des ingrédients via l'API
        // Pour l'instant, on ne peut pas car l'API ne gère pas encore les ingrédients de recette
        // Il faudra créer un endpoint PUT /api/recipes/{id}/ingredients
    }
}

