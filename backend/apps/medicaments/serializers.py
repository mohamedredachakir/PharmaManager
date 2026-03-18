"""
Serializers for PharmaManager medicaments app.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Medicament


class MedicamentListSerializer(serializers.ModelSerializer):
    """
    Read serializer used for medicament list and detail responses.

    Attributes:
        id (int): Medicament identifier.
        nom (str): Commercial name.
        dci (str): Generic denomination.
        categorie (int): Category id.
        prix_achat (Decimal): Purchase price.
        prix_vente (Decimal): Sale price.
        stock_actuel (int): Current stock quantity.
        stock_minimum (int): Low-stock threshold.
        est_en_alerte (bool): Computed low-stock indicator.

    Returns:
        dict: Serialized medicament payload for API reads.
    """
    est_en_alerte = serializers.SerializerMethodField()

    class Meta:
        model = Medicament
        fields = [
            'id', 'nom', 'dci', 'categorie', 'forme', 'dosage',
            'prix_achat', 'prix_vente', 'stock_actuel', 'stock_minimum',
            'date_expiration', 'ordonnance_requise', 'est_en_alerte', 'date_creation'
        ]
        read_only_fields = ['id', 'date_creation', 'est_en_alerte']

    def get_est_en_alerte(self, obj):
        """Return True if stock is at or below minimum."""
        return obj.est_en_alerte


class MedicamentCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer for medicament creation.

    Attributes:
        nom (str): Commercial name.
        dci (str): Generic denomination.
        categorie (int): Linked category id.
        forme (str): Pharmaceutical form.
        dosage (str): Product dosage.
        prix_achat (Decimal): Purchase price.
        prix_vente (Decimal): Sale price.
        stock_actuel (int): Initial stock quantity.
        stock_minimum (int): Alert threshold.
        date_expiration (date): Expiry date.
        ordonnance_requise (bool): Prescription flag.

    Returns:
        Medicament: Created medicament instance.
    """

    class Meta:
        model = Medicament
        fields = [
            'nom', 'dci', 'categorie', 'forme', 'dosage',
            'prix_achat', 'prix_vente', 'stock_actuel', 'stock_minimum',
            'date_expiration', 'ordonnance_requise'
        ]

    def validate(self, data):
        """Validate that prix_vente > prix_achat and date_expiration is in future."""
        if data['prix_vente'] <= data['prix_achat']:
            raise serializers.ValidationError(
                'Le prix de vente doit être supérieur au prix d\'achat.'
            )

        if data['date_expiration'] <= timezone.now().date():
            raise serializers.ValidationError(
                'La date d\'expiration doit être dans le futur.'
            )

        return data

    def validate_stock_minimum(self, value):
        """Ensure stock_minimum is not negative."""
        if value < 0:
            raise serializers.ValidationError('Le stock minimum ne peut pas être négatif.')
        return value


class MedicamentUpdateSerializer(serializers.ModelSerializer):
    """
    Write serializer for medicament update and partial update.

    Attributes:
        nom (str): Commercial name.
        dci (str): Generic denomination.
        categorie (int): Linked category id.
        forme (str): Pharmaceutical form.
        dosage (str): Product dosage.
        prix_achat (Decimal): Purchase price.
        prix_vente (Decimal): Sale price.
        stock_actuel (int): Current stock quantity.
        stock_minimum (int): Alert threshold.
        date_expiration (date): Expiry date.
        ordonnance_requise (bool): Prescription flag.

    Returns:
        Medicament: Updated medicament instance.
    """

    class Meta:
        model = Medicament
        fields = [
            'nom', 'dci', 'categorie', 'forme', 'dosage',
            'prix_achat', 'prix_vente', 'stock_actuel', 'stock_minimum',
            'date_expiration', 'ordonnance_requise'
        ]

    def validate(self, data):
        """Validate that prix_vente > prix_achat and date_expiration is in future."""
        prix_vente = data.get('prix_vente', self.instance.prix_vente)
        prix_achat = data.get('prix_achat', self.instance.prix_achat)
        
        if prix_vente <= prix_achat:
            raise serializers.ValidationError(
                'Le prix de vente doit être supérieur au prix d\'achat.'
            )

        date_expiration = data.get('date_expiration', self.instance.date_expiration)
        if date_expiration <= timezone.now().date():
            raise serializers.ValidationError(
                'La date d\'expiration doit être dans le futur.'
            )

        return data

    def validate_stock_minimum(self, value):
        """Ensure stock_minimum is not negative."""
        if value < 0:
            raise serializers.ValidationError('Le stock minimum ne peut pas être négatif.')
        return value
