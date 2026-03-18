"""
Models for PharmaManager categories app.
"""

from django.db import models


class Categorie(models.Model):
    """
    Represents a drug category (e.g. antibiotic, analgesic).

    Attributes:
        nom (str): Category name, must be unique.
        description (str): Optional description of the category.
        date_creation (datetime): Auto-set on creation.
    """
    nom = models.CharField(max_length=100, unique=True, verbose_name='Nom')
    description = models.TextField(blank=True, verbose_name='Description')
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['nom']

    def __str__(self):
        return self.nom
