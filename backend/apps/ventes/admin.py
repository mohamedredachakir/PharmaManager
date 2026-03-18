"""
Django admin configuration for ventes app.
"""

from django.contrib import admin
from .models import Vente, LigneVente


class LigneVenteInline(admin.TabularInline):
    """Inline admin for LigneVente within Vente."""
    model = LigneVente
    extra = 0
    readonly_fields = ['sous_total']
    fields = ['medicament', 'quantite', 'prix_unitaire', 'sous_total']


@admin.register(Vente)
class VenteAdmin(admin.ModelAdmin):
    """Admin interface for Vente model."""
    list_display = ['reference', 'date_vente', 'total_ttc', 'statut']
    search_fields = ['reference']
    list_filter = ['statut', 'date_vente']
    readonly_fields = ['reference', 'date_vente']
    ordering = ['-date_vente']
    inlines = [LigneVenteInline]


@admin.register(LigneVente)
class LigneVenteAdmin(admin.ModelAdmin):
    """Admin interface for LigneVente model."""
    list_display = ['vente', 'medicament', 'quantite', 'prix_unitaire', 'sous_total']
    search_fields = ['vente__reference', 'medicament__nom']
    list_filter = ['vente__date_vente']
    readonly_fields = ['sous_total']
    ordering = ['-vente__date_vente']
