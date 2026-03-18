"""
ViewSets for PharmaManager categories app.
"""

from rest_framework.viewsets import ModelViewSet
from drf_spectacular.utils import extend_schema, OpenApiExample
from .models import Categorie
from .serializers import CategorieSerializer


@extend_schema(tags=['Catégories'])
class CategorieViewSet(ModelViewSet):
    """
    ViewSet for full category management.

    Endpoints:
        GET /categories/: List all categories.
        POST /categories/: Create a new category.
        GET /categories/{id}/: Retrieve one category.
        PUT /categories/{id}/: Replace one category.
        PATCH /categories/{id}/: Partially update one category.
        DELETE /categories/{id}/: Delete one category.

    Notes:
        Categories are used by medicaments through a protected foreign key.
        Deletion may fail if the category is still referenced.
    """
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer

    @extend_schema(
        summary='Lister les catégories',
        description='Retourne la liste de toutes les catégories de médicaments.',
        responses={200: CategorieSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Exemple de catégorie',
                value={
                    'id': 1,
                    'nom': 'Antibiotique',
                    'description': 'Médicaments pour les infections bactériennes',
                    'date_creation': '2026-03-18T10:00:00Z',
                },
                response_only=True,
            )
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary='Créer une catégorie',
        description='Crée une nouvelle catégorie de médicament.',
        responses={201: CategorieSerializer},
        examples=[
            OpenApiExample(
                'Payload création catégorie',
                value={'nom': 'Compléments', 'description': 'Vitamines et minéraux'},
                request_only=True,
            )
        ],
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary='Récupérer les détails d\'une catégorie',
        description='Retourne les informations détaillées d\'une catégorie spécifique.',
        responses={200: CategorieSerializer},
        examples=[
            OpenApiExample(
                'Réponse détail catégorie',
                value={
                    'id': 2,
                    'nom': 'Antalgique',
                    'description': 'Médicaments pour soulager la douleur',
                    'date_creation': '2026-03-18T10:00:00Z',
                },
                response_only=True,
            )
        ],
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary='Mettre à jour une catégorie',
        description='Met à jour les informations d\'une catégorie existante.',
        responses={200: CategorieSerializer},
        examples=[
            OpenApiExample(
                'Payload mise à jour catégorie',
                value={'nom': 'Antalgique', 'description': 'Mise à jour de description'},
                request_only=True,
            )
        ],
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary='Modifier partiellement une catégorie',
        description='Met à jour partiellement les champs d\'une catégorie existante.',
        responses={200: CategorieSerializer},
        examples=[
            OpenApiExample(
                'Payload patch catégorie',
                value={'description': 'Description mise à jour'},
                request_only=True,
            )
        ],
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary='Supprimer une catégorie',
        description='Supprime une catégorie de la base de données.',
        responses={204: None},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
