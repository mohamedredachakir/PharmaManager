"""
Serializers for PharmaManager categories app.
"""

from rest_framework import serializers
from .models import Categorie


class CategorieSerializer(serializers.ModelSerializer):
    """
    Serializer for Categorie model.
    Validates that nom is not empty or blank.
    """

    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'description', 'date_creation']
        read_only_fields = ['id', 'date_creation']

    def validate_nom(self, value):
        """Ensure nom is not empty or blank."""
        if not value or not value.strip():
            raise serializers.ValidationError('Le nom de la catégorie est obligatoire.')
        return value.strip()
