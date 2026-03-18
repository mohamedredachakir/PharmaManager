"""
Django admin configuration for categories app.
"""

from django.contrib import admin
from .models import Categorie


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    """Admin interface for Categorie model."""
    list_display = ['nom', 'date_creation']
    search_fields = ['nom', 'description']
    list_filter = ['date_creation']
    ordering = ['nom']
