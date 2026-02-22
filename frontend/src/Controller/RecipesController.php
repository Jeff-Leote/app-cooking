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
                $quantiteRaw = $ri['quantite'] ?? '';
                $quantite = null;
                $unite = null;
                
                // Parser la quantité pour séparer le nombre de l'unité
                // Ex: "200 g" -> quantite = 200, unite = "g"
                if (!empty($quantiteRaw)) {
                    // Extraire le nombre
                    if (preg_match('/^(\d+(?:\.\d+)?)\s*(.*)$/', trim($quantiteRaw), $matches)) {
                        $quantite = (float) $matches[1];
                        $uniteRaw = trim($matches[2]);
                        
                        // Mapper les unités communes
                        $uniteMap = [
                            'g' => 'g',
                            'kg' => 'kg',
                            'cl' => 'cl',
                            'dl' => 'dl',
                            'l' => 'l',
                            'ml' => 'cl', // Convertir ml en cl pour le select
                            'pièces' => 'pièces',
                            'pièce' => 'pièces',
                            'cuillères à soupe' => 'cuillères à soupe',
                            'cuillère à soupe' => 'cuillères à soupe',
                            'cuillères à café' => 'cuillères à café',
                            'cuillère à café' => 'cuillères à café',
                            'pincées' => 'pincées',
                            'pincée' => 'pincées',
                        ];
                        
                        $unite = $uniteMap[$uniteRaw] ?? $uniteRaw;
                    } elseif (is_numeric($quantiteRaw)) {
                        // Si c'est juste un nombre, pas d'unité
                        $quantite = (float) $quantiteRaw;
                    }
                }
                
                // Utiliser le nom de l'ingrédient pour l'autocomplete
                $ingredientName = $ri['ingredient']['nom'] ?? null;
                $ingredientId = $ri['ingredient']['id'] ?? $ri['ingredient_id'] ?? null;
                
                $recipeIngredients[] = [
                    'ingredient_id' => $ingredientName ?: $ingredientId,
                    'quantite' => $quantite,
                    'unite' => $unite,
                ];
            }
        }
        $recipe['ingredients'] = $recipeIngredients;

        $form = $this->createForm(RecipeType::class, $recipe, [
            'is_edit' => true,
            'ingredients' => $ingredients,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if (!$form->isValid()) {
                // Afficher les erreurs de validation
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                $this->addFlash('error', 'Erreurs de validation : ' . implode(', ', $errors));
            } else {
                $data = $form->getData();
                
                // Debug: logger toutes les données reçues
                error_log('=== DONNÉES COMPLÈTES DU FORMULAIRE ===');
                error_log(json_encode($data, JSON_PRETTY_PRINT));
                
                // Séparer les ingrédients des données de la recette
                $ingredients = $data['ingredients'] ?? [];
                unset($data['ingredients']);
                
                // Debug: logger les ingrédients reçus
                error_log('=== INGRÉDIENTS EXTRAITS ===');
                error_log('Nombre d\'ingrédients: ' . count($ingredients));
                error_log(json_encode($ingredients, JSON_PRETTY_PRINT));
                
                // Filtrer les données pour ne garder que les champs autorisés
                $allowedFields = ['titre', 'description', 'temps_preparation', 'image_url', 'is_favorite'];
                $filteredData = array_intersect_key($data, array_flip($allowedFields));
                
                try {
                    $backendUrl = $this->getBackendUrl();
                    $response = $this->httpClient->request('PATCH', "{$backendUrl}/api/recipes/{$id}", [
                        'json' => $filteredData,
                        'headers' => [
                            'Content-Type' => 'application/json',
                        ],
                        'timeout' => 30,
                    ]);

                    if ($response->getStatusCode() === 200) {
                        // Sauvegarder les ingrédients
                        $ingredientsCount = count($ingredients);
                        $this->updateRecipeIngredients($id, $ingredients);
                        
                        $message = 'Recette modifiée avec succès !';
                        if ($ingredientsCount > 0) {
                            $message .= " ($ingredientsCount ingrédient(s) ajouté(s))";
                        }
                        $this->addFlash('success', $message);
                        return $this->redirectToRoute('app_recipes');
                    }
                } catch (\Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface $e) {
                    $this->addFlash('error', 'Impossible de se connecter au backend. Vérifiez que le service backend est démarré.');
                } catch (\Exception $e) {
                    $errorMessage = $e->getMessage();
                    if ($e instanceof \Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface) {
                        $response = $e->getResponse();
                        if ($response) {
                            $errorData = $response->toArray(false);
                            $errorMessage = $errorData['message'] ?? $errorMessage;
                        }
                    }
                    $this->addFlash('error', 'Erreur lors de la modification de la recette : ' . $errorMessage);
                }
            }
        }

        return $this->render('recipes/edit.html.twig', [
            'page_title' => 'Modifier la recette',
            'form' => $form,
            'recipe' => $recipe,
        ]);
    }

    #[Route('/recipes/{id}', name: 'app_recipes_show')]
    public function show(int $id): Response
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

        return $this->render('recipes/show.html.twig', [
            'page_title' => $recipe['titre'] ?? 'Recette',
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
    private function findIngredientIdByName(string $ingredientName): ?int
    {
        try {
            $backendUrl = $this->getBackendUrl();
            $response = $this->httpClient->request('GET', "{$backendUrl}/api/ingredients", [
                'query' => ['search' => $ingredientName],
                'timeout' => 30,
            ]);
            
            $allIngredients = $response->toArray();
            
            // Chercher un ingrédient avec le nom exact (insensible à la casse)
            foreach ($allIngredients as $ingredient) {
                if (isset($ingredient['nom']) && strtolower(trim($ingredient['nom'])) === strtolower(trim($ingredientName))) {
                    return $ingredient['id'] ?? null;
                }
            }
            
            return null;
        } catch (\Exception $e) {
            error_log('Erreur lors de la recherche de l\'ingrédient: ' . $e->getMessage());
            return null;
        }
    }

    private function addRecipeIngredients(int $recipeId, array $ingredients): void
    {
        if (empty($ingredients)) {
            return;
        }

        try {
            $backendUrl = $this->getBackendUrl();
            
            // Formater les ingrédients pour l'API
            $formattedIngredients = [];
            foreach ($ingredients as $ing) {
                // Le formulaire peut retourner les données sous différentes formes
                $ingredientIdOrName = $ing['ingredient_id'] ?? $ing['ingredientId'] ?? null;
                $quantite = $ing['quantite'] ?? $ing['quantity'] ?? null;
                
                if ($ingredientIdOrName !== null && $ingredientIdOrName !== '') {
                    // Si c'est un nombre, c'est un ID, sinon c'est un nom
                    $ingredientId = is_numeric($ingredientIdOrName) 
                        ? (int)$ingredientIdOrName 
                        : $this->findIngredientIdByName((string)$ingredientIdOrName);
                    
                    if ($ingredientId !== null) {
                        $formattedIngredients[] = [
                            'ingredient_id' => $ingredientId,
                            'quantite' => $quantite ? (string)$quantite : null,
                        ];
                    } else {
                        error_log('Ingrédient non trouvé: ' . $ingredientIdOrName);
                    }
                }
            }

            if (empty($formattedIngredients)) {
                error_log('Aucun ingrédient valide à ajouter pour la recette ' . $recipeId);
                error_log('Ingrédients reçus: ' . json_encode($ingredients, JSON_PRETTY_PRINT));
                return;
            }

            error_log('Envoi de ' . count($formattedIngredients) . ' ingrédient(s) à l\'API pour la recette ' . $recipeId);
            error_log('Données formatées: ' . json_encode($formattedIngredients, JSON_PRETTY_PRINT));

            $response = $this->httpClient->request('POST', "{$backendUrl}/api/recipes/{$recipeId}/ingredients", [
                'json' => ['ingredients' => $formattedIngredients],
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'timeout' => 30,
            ]);
            
            $statusCode = $response->getStatusCode();
            error_log('Réponse API pour ingrédients: HTTP ' . $statusCode);
            
            if ($statusCode !== 200) {
                $responseBody = $response->getContent(false);
                error_log('Erreur HTTP lors de l\'ajout des ingrédients: ' . $statusCode);
                error_log('Réponse: ' . $responseBody);
            } else {
                error_log('Ingrédients ajoutés avec succès pour la recette ' . $recipeId);
            }
        } catch (\Exception $e) {
            // Log l'erreur mais ne bloque pas la création/modification de la recette
            error_log('Erreur lors de l\'ajout des ingrédients: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
        }
    }
    
    /**
     * Met à jour les ingrédients d'une recette
     */
    private function updateRecipeIngredients(int $recipeId, array $ingredients): void
    {
        // Utilise la même méthode que addRecipeIngredients car l'endpoint remplace tous les ingrédients
        $this->addRecipeIngredients($recipeId, $ingredients);
    }
}

