"""
ViewSets for PharmaManager ventes app.
"""

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiExample
from .models import Vente
from .serializers import VenteCreateSerializer, VenteReadSerializer


@extend_schema(tags=['Ventes'])
class VenteViewSet(ModelViewSet):
    """
    ViewSet for sales transactions and stock impact workflows.

    Endpoints:
        GET /ventes/: List sales with nested lines.
        POST /ventes/: Create sale, deduct stock, snapshot prices.
        GET /ventes/{id}/: Retrieve one sale with lines.
        POST /ventes/{id}/annuler/: Cancel sale and restore stock.

    Notes:
        Update and delete methods are intentionally disabled.
        Creation is transactional to avoid partial stock updates.
    """
    queryset = Vente.objects.all()
    http_method_names = ['get', 'post', 'head', 'options']

    def get_serializer_class(self):
        """Use VenteCreateSerializer for POST, VenteReadSerializer otherwise."""
        if self.action == 'create':
            return VenteCreateSerializer
        return VenteReadSerializer

    @extend_schema(
        summary='Lister les ventes',
        description='Retourne la liste paginée de toutes les ventes enregistrées.',
        responses={200: VenteReadSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Exemple de vente',
                value={
                    'id': 1,
                    'reference': 'VNT-2026-0001',
                    'date_vente': '2026-03-18T10:15:00Z',
                    'total_ttc': '25.48',
                    'statut': 'COMPLETEE',
                    'notes': 'Client comptoir',
                    'lignes': [],
                },
                response_only=True,
            )
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary='Enregistrer une nouvelle vente',
        description='Enregistre une nouvelle transaction de vente avec des lignes de médicaments, déduction de stock et snapshot de prix.',
        request=VenteCreateSerializer,
        responses={201: VenteReadSerializer},
        examples=[
            OpenApiExample(
                'Payload création vente',
                value={
                    'notes': 'Client regulier',
                    'lignes': [
                        {'medicament_id': 1, 'quantite': 2},
                        {'medicament_id': 3, 'quantite': 1},
                    ],
                },
                request_only=True,
            )
        ],
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vente = serializer.save()
        read_serializer = VenteReadSerializer(vente, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary='Récupérer les détails d\'une vente',
        description='Retourne les détails complets d\'une vente, y compris toutes ses lignes.',
        responses={200: VenteReadSerializer},
        examples=[
            OpenApiExample(
                'Réponse détail vente',
                value={
                    'id': 7,
                    'reference': 'VNT-2026-0007',
                    'date_vente': '2026-03-18T11:20:00Z',
                    'total_ttc': '14.98',
                    'statut': 'COMPLETEE',
                    'notes': 'Paiement cash',
                    'lignes': [
                        {
                            'id': 20,
                            'medicament': {'id': 1, 'nom': 'Paracétamol'},
                            'quantite': 2,
                            'prix_unitaire': '2.50',
                            'sous_total': '5.00',
                        }
                    ],
                },
                response_only=True,
            )
        ],
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary='Annuler une vente',
        description='Annule une vente complétée et restaure les quantités vendues au stock.',
        responses={200: VenteReadSerializer, 409: 'Erreur: la vente est déjà annulée.'},
        examples=[
            OpenApiExample(
                'Réponse annulation réussie',
                value={'id': 7, 'reference': 'VNT-2026-0007', 'statut': 'ANNULEE'},
                response_only=True,
            )
        ],
    )
    @action(detail=True, methods=['post'], url_path='annuler')
    def annuler(self, request, pk=None):
        """Cancel a sale and restore stock."""
        vente = self.get_object()
        try:
            vente.annuler()
            serializer = self.get_serializer(vente)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_409_CONFLICT
            )
