"""
Models for PharmaManager medicaments app.
"""

from django.db import models


class Medicament(models.Model):
    """
    Represents a drug in the pharmacy inventory.

    Attributes:
        nom (str): Commercial name of the drug.
        dci (str): International Non-proprietary Name.
        categorie (Categorie): FK to drug category.
        forme (str): Galenic form (tablet, syrup, injection...).
        dosage (str): Dosage (e.g. 500mg, 250mg/5ml).
        prix_achat (Decimal): Unit purchase price.
        prix_vente (Decimal): Public sale price.
        stock_actuel (int): Current stock quantity.
        stock_minimum (int): Reorder alert threshold.
        date_expiration (date): Expiry date.
        ordonnance_requise (bool): Whether prescription is required.
        date_creation (datetime): Auto-set on creation.
        est_actif (bool): Soft delete flag. False = archived.
    """
    nom = models.CharField(max_length=200, verbose_name='Nom commercial')
    dci = models.CharField(max_length=200, blank=True, verbose_name='DCI')
    categorie = models.ForeignKey(
        'categories.Categorie',
        on_delete=models.PROTECT,
        related_name='medicaments',
        verbose_name='Catégorie'
    )
    forme = models.CharField(max_length=100, verbose_name='Forme galénique')
    dosage = models.CharField(max_length=100, verbose_name='Dosage')
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix d'achat")
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Prix de vente')
    stock_actuel = models.PositiveIntegerField(default=0, verbose_name='Stock actuel')
    stock_minimum = models.PositiveIntegerField(default=10, verbose_name='Stock minimum')
    date_expiration = models.DateField(verbose_name="Date d'expiration")
    ordonnance_requise = models.BooleanField(default=False, verbose_name='Ordonnance requise')
    date_creation = models.DateTimeField(auto_now_add=True)
    est_actif = models.BooleanField(default=True, verbose_name='Actif')

    class Meta:
        verbose_name = 'Médicament'
        verbose_name_plural = 'Médicaments'
        ordering = ['nom']

    def __str__(self):
        return f'{self.nom} ({self.dosage})'

    @property
    def est_en_alerte(self):
        """Returns True if current stock is at or below the minimum threshold."""
        return self.stock_actuel <= self.stock_minimum
