"""
Django admin configuration for medicaments app.
"""

from django.contrib import admin
from .models import Medicament


@admin.register(Medicament)
class MedicamentAdmin(admin.ModelAdmin):
    """Admin interface for Medicament model."""
    list_display = ['nom', 'dci', 'categorie', 'stock_actuel', 'stock_minimum', 'est_en_alerte', 'est_actif', 'date_creation']
    search_fields = ['nom', 'dci']
    list_filter = ['categorie', 'ordonnance_requise', 'est_actif', 'date_creation']
    readonly_fields = ['date_creation', 'est_en_alerte']
    ordering = ['nom']

    fieldsets = (
        ('Informations Générales', {
            'fields': ('nom', 'dci', 'categorie', 'forme', 'dosage')
        }),
        ('Prix', {
            'fields': ('prix_achat', 'prix_vente')
        }),
        ('Stock', {
            'fields': ('stock_actuel', 'stock_minimum', 'est_en_alerte')
        }),
        ('Dates et Statut', {
            'fields': ('date_expiration', 'date_creation', 'est_actif', 'ordonnance_requise')
        }),
    )
