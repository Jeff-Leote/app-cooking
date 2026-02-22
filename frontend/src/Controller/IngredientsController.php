<?php

namespace App\Controller;

use App\Form\IngredientType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class IngredientsController extends AbstractController
{
    public function __construct(
        private readonly HttpClientInterface $httpClient
    ) {
    }

    private function filterIngredientPayload(array $data): array
    {
        // Ne jamais envoyer des champs non attendus par le backend (DTO whitelist)
        $payload = array_intersect_key($data, array_flip(['nom', 'categorie']));

        // ChoiceType renvoie souvent '' quand rien n'est sélectionné -> on l'enlève
        if (array_key_exists('categorie', $payload) && ($payload['categorie'] === '' || $payload['categorie'] === null)) {
            unset($payload['categorie']);
        }

        return $payload;
    }
    
    private function getBackendUrl(): string
    {
        return $_ENV['APP_BACKEND_URL'] ?? $_SERVER['APP_BACKEND_URL'] ?? 'http://backend:3000';
    }

    #[Route('/ingredients', name: 'app_ingredients')]
    public function index(): Response
    {
        return $this->render('ingredients/index.html.twig', [
            'page_title' => 'Mes Ingrédients',
        ]);
    }

    #[Route('/ingredients/new', name: 'app_ingredients_new')]
    public function new(Request $request): Response
    {
        $form = $this->createForm(IngredientType::class, null, [
            'is_edit' => false,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && !$form->isValid()) {
            $this->addFlash('error', 'Formulaire invalide. Vérifiez les champs et réessayez.');
        }

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $this->filterIngredientPayload($form->getData());
            
            try {
                $backendUrl = $this->getBackendUrl();
                $response = $this->httpClient->request('POST', "{$backendUrl}/api/ingredients", [
                    'json' => $data,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                    'timeout' => 30,
                ]);

                $statusCode = $response->getStatusCode();
                if ($statusCode === 201) {
                    $this->addFlash('success', 'Ingrédient créé avec succès !');
                    return $this->redirectToRoute('app_ingredients');
                }

                // Afficher le message d'erreur backend au lieu de rester silencieux
                $body = $response->getContent(false);
                $this->addFlash('error', sprintf('Erreur backend (HTTP %d) : %s', $statusCode, $body ?: 'Réponse vide'));
            } catch (\Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface $e) {
                $this->addFlash('error', 'Impossible de se connecter au backend. Vérifiez que le service backend est démarré.');
            } catch (\Exception $e) {
                $this->addFlash('error', 'Erreur lors de la création de l\'ingrédient : ' . $e->getMessage());
            }
        }

        return $this->render('ingredients/new.html.twig', [
            'page_title' => 'Créer un ingrédient',
            'form' => $form,
        ]);
    }

    #[Route('/ingredients/{id}/edit', name: 'app_ingredients_edit')]
    public function edit(int $id, Request $request): Response
    {
        try {
            $backendUrl = $this->getBackendUrl();
            $response = $this->httpClient->request('GET', "{$backendUrl}/api/ingredients/{$id}", [
                'timeout' => 30,
            ]);
            $ingredient = $response->toArray();
        } catch (\Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface $e) {
            $this->addFlash('error', 'Impossible de se connecter au backend. Vérifiez que le service backend est démarré.');
            return $this->redirectToRoute('app_ingredients');
        } catch (\Exception $e) {
            $this->addFlash('error', 'Ingrédient introuvable');
            return $this->redirectToRoute('app_ingredients');
        }

        $form = $this->createForm(IngredientType::class, $ingredient, [
            'is_edit' => true,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && !$form->isValid()) {
            $this->addFlash('error', 'Formulaire invalide. Vérifiez les champs et réessayez.');
        }

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $this->filterIngredientPayload($form->getData());
            
            try {
                $backendUrl = $this->getBackendUrl();
                $response = $this->httpClient->request('PATCH', "{$backendUrl}/api/ingredients/{$id}", [
                    'json' => $data,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                    'timeout' => 30,
                ]);

                $statusCode = $response->getStatusCode();
                if ($statusCode === 200) {
                    $this->addFlash('success', 'Ingrédient modifié avec succès !');
                    return $this->redirectToRoute('app_ingredients');
                }

                $body = $response->getContent(false);
                $this->addFlash('error', sprintf('Erreur backend (HTTP %d) : %s', $statusCode, $body ?: 'Réponse vide'));
            } catch (\Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface $e) {
                $this->addFlash('error', 'Impossible de se connecter au backend. Vérifiez que le service backend est démarré.');
            } catch (\Exception $e) {
                $this->addFlash('error', 'Erreur lors de la modification de l\'ingrédient : ' . $e->getMessage());
            }
        }

        return $this->render('ingredients/edit.html.twig', [
            'page_title' => 'Modifier l\'ingrédient',
            'form' => $form,
            'ingredient' => $ingredient,
        ]);
    }
}
