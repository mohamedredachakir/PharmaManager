"""
Serializers for PharmaManager ventes app.
"""

from rest_framework import serializers
from django.db import transaction
from .models import Vente, LigneVente
from apps.medicaments.models import Medicament


class LigneVenteCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating ligne vente.
    Validates that medicament has sufficient stock.
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
    Serializer for reading ligne vente.
    Includes nested medicament information.
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
    Serializer for creating a sale.
    Accepts nested lignes. Captures price snapshot, deducts stock, computes total.
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
    Serializer for reading vente details.
    Includes nested lignes with full details.
    """
    lignes = LigneVenteReadSerializer(many=True, read_only=True)

    class Meta:
        model = Vente
        fields = ['id', 'reference', 'date_vente', 'total_ttc', 'statut', 'notes', 'lignes']
        read_only_fields = ['id', 'reference', 'date_vente', 'lignes']
