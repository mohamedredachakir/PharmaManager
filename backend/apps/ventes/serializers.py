"""
Serializers for PharmaManager ventes app.
"""

from rest_framework import serializers
from django.db import transaction
from .models import Vente, LigneVente
from apps.medicaments.models import Medicament


class LigneVenteCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer for creating a sale line item.

    Attributes:
        medicament_id (int): Target medicament id.
        quantite (int): Quantity requested.

    Returns:
        dict: Validated payload enriched with the resolved medicament instance.
    """
    medicament_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = LigneVente
        fields = ['medicament_id', 'quantite']

    def validate(self, data):
        """Validate medicament exists and has sufficient stock."""
        try:
            medicament = Medicament.objects.get(id=data['medicament_id'], est_actif=True)
        except Medicament.DoesNotExist:
            raise serializers.ValidationError('Médicament non trouvé ou inactif.')

        if medicament.stock_actuel < data['quantite']:
            raise serializers.ValidationError(
                f'Stock insuffisant. Disponible: {medicament.stock_actuel}, Demandé: {data["quantite"]}'
            )

        data['medicament'] = medicament
        return data


class LigneVenteReadSerializer(serializers.ModelSerializer):
    """
    Read serializer for sale line details.

    Attributes:
        id (int): Line identifier.
        medicament (dict): Nested medicament id and name.
        quantite (int): Sold quantity.
        prix_unitaire (Decimal): Snapshot unit price.
        sous_total (Decimal): Computed line total.

    Returns:
        dict: Serialized sale-line payload.
    """
    medicament = serializers.SerializerMethodField()

    class Meta:
        model = LigneVente
        fields = ['id', 'medicament', 'quantite', 'prix_unitaire', 'sous_total']
        read_only_fields = ['id', 'sous_total']

    def get_medicament(self, obj):
        """Return medicament name."""
        return {'id': obj.medicament.id, 'nom': obj.medicament.nom}


class VenteCreateSerializer(serializers.Serializer):
    """
    Write serializer for creating a complete sale transaction.

    Attributes:
        lignes (list): Collection of sale line payloads.
        notes (str): Optional free-text note.

    Returns:
        Vente: Persisted sale with computed totals and deducted stock.
    """
    lignes = LigneVenteCreateSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_lignes(self, value):
        """Ensure at least one ligne is provided."""
        if not value:
            raise serializers.ValidationError('Au moins une ligne de vente est requise.')
        return value

    def create(self, validated_data):
        """Create vente with lignes, price snapshot, stock deduction, and total calculation."""
        lignes_data = validated_data.pop('lignes')
        notes = validated_data.get('notes', '')

        with transaction.atomic():
            vente = Vente.objects.create(notes=notes)
            total = 0

            for ligne_data in lignes_data:
                medicament = ligne_data['medicament']
                quantite = ligne_data['quantite']
                prix_unitaire = medicament.prix_vente

                LigneVente.objects.create(
                    vente=vente,
                    medicament=medicament,
                    quantite=quantite,
                    prix_unitaire=prix_unitaire,
                    sous_total=quantite * prix_unitaire
                )

                medicament.stock_actuel -= quantite
                medicament.save()

                total += quantite * prix_unitaire

            vente.total_ttc = total
            vente.save()

        return vente


class VenteReadSerializer(serializers.ModelSerializer):
    """
    Read serializer for sale headers and nested line details.

    Attributes:
        id (int): Sale id.
        reference (str): Business sale code.
        date_vente (datetime): Sale creation timestamp.
        total_ttc (Decimal): Total amount.
        statut (str): Sale state.
        notes (str): Optional sale note.
        lignes (list): Nested list of serialized line items.

    Returns:
        dict: Serialized sale response payload.
    """
    lignes = LigneVenteReadSerializer(many=True, read_only=True)

    class Meta:
        model = Vente
        fields = ['id', 'reference', 'date_vente', 'total_ttc', 'statut', 'notes', 'lignes']
        read_only_fields = ['id', 'reference', 'date_vente', 'lignes']
