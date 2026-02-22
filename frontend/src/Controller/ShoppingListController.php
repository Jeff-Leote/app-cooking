<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ShoppingListController extends AbstractController
{
    public function __construct(
        private HttpClientInterface $httpClient,
    ) {
    }

    #[Route('/shopping-list', name: 'app_shopping_list')]
    public function index(): Response
    {
        return $this->render('shopping-list/index.html.twig');
    }

    private function getBackendUrl(): string
    {
        return $_ENV['APP_BACKEND_URL'] ?? $_SERVER['APP_BACKEND_URL'] ?? 'http://backend:3000';
    }
}
