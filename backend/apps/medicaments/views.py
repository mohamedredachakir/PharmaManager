"""
ViewSets for PharmaManager medicaments app.
"""

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.db.models import F
from .models import Medicament
from .serializers import MedicamentListSerializer, MedicamentCreateSerializer, MedicamentUpdateSerializer


@extend_schema(tags=['Médicaments'])
class MedicamentViewSet(ModelViewSet):
    """
    ViewSet for managing pharmacy medicaments.
    - Filters to show only active medicaments
    - Soft delete: DELETE sets est_actif=False
    - Custom alertes endpoint for low stock items
    """
    filterset_fields = ['categorie', 'ordonnance_requise']
    search_fields = ['nom', 'dci']

    def get_queryset(self):
        """Return only active medicaments by default."""
        return Medicament.objects.filter(est_actif=True)

    def get_serializer_class(self):
        """Use appropriate serializer based on action."""
        if self.action == 'create':
            return MedicamentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MedicamentUpdateSerializer
        return MedicamentListSerializer

    @extend_schema(
        summary='Lister les médicaments actifs',
        description='Retourne une liste paginée des médicaments actifs.',
        responses={200: MedicamentListSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Exemple médicament',
                value={
                    'id': 1,
                    'nom': 'Paracétamol',
                    'dci': 'Paracétamol',
                    'categorie': 2,
                    'forme': 'Comprimé',
                    'dosage': '1000mg',
                    'prix_achat': '0.80',
                    'prix_vente': '2.50',
                    'stock_actuel': 150,
                    'stock_minimum': 50,
                    'date_expiration': '2027-06-30',
                    'ordonnance_requise': False,
                    'est_en_alerte': False,
                    'date_creation': '2026-03-18T10:00:00Z',
                },
                response_only=True,
            )
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary='Créer un nouveau médicament',
        description='Crée un nouveau médicament dans l\'inventaire.',
        request=MedicamentCreateSerializer,
        responses={201: MedicamentListSerializer},
        examples=[
            OpenApiExample(
                'Payload création médicament',
                value={
                    'nom': 'Test Med',
                    'dci': 'Substance X',
                    'categorie': 1,
                    'forme': 'Comprimé',
                    'dosage': '500mg',
                    'prix_achat': '2.50',
                    'prix_vente': '5.00',
                    'stock_actuel': 40,
                    'stock_minimum': 10,
                    'date_expiration': '2027-12-31',
                    'ordonnance_requise': True,
                },
                request_only=True,
            )
        ],
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        read_serializer = MedicamentListSerializer(instance, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary='Récupérer un médicament',
        description='Retourne les détails d\'un médicament spécifique.',
        responses={200: MedicamentListSerializer},
        examples=[
            OpenApiExample(
                'Réponse détail médicament',
                value={
                    'id': 3,
                    'nom': 'Ibuprofène',
                    'dci': 'Ibuprofène',
                    'categorie': 2,
                    'forme': 'Comprimé',
                    'dosage': '400mg',
                    'prix_achat': '1.20',
                    'prix_vente': '3.99',
                    'stock_actuel': 8,
                    'stock_minimum': 20,
                    'date_expiration': '2027-03-31',
                    'ordonnance_requise': False,
                    'est_en_alerte': True,
                    'date_creation': '2026-03-18T10:00:00Z',
                },
                response_only=True,
            )
        ],
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary='Mettre à jour un médicament',
        description='Met à jour les informations d\'un médicament.',
        request=MedicamentUpdateSerializer,
        responses={200: MedicamentListSerializer},
        examples=[
            OpenApiExample(
                'Payload mise à jour médicament',
                value={'stock_actuel': 75, 'prix_vente': '6.20'},
                request_only=True,
            )
        ],
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary='Soft delete un médicament',
        description='Archive un médicament en définissant est_actif=False.',
        responses={204: None},
    )
    def destroy(self, request, *args, **kwargs):
        """Soft delete: set est_actif=False instead of deleting."""
        instance = self.get_object()
        instance.est_actif = False
        instance.save()
        return Response(status=204)

    @extend_schema(
        summary='Médicaments en rupture de stock',
        description='Retourne la liste des médicaments actifs dont le stock actuel est inférieur ou égal au stock minimum.',
        responses={200: MedicamentListSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Réponse alertes stock',
                value=[
                    {
                        'id': 4,
                        'nom': 'Azithromycine',
                        'stock_actuel': 5,
                        'stock_minimum': 10,
                        'est_en_alerte': True,
                    }
                ],
                response_only=True,
            )
        ],
    )
    @action(detail=False, methods=['get'], url_path='alertes')
    def alertes(self, request):
        """Return all active medicaments where stock_actuel <= stock_minimum."""
        queryset = self.get_queryset().filter(stock_actuel__lte=F('stock_minimum'))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
