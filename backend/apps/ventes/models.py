"""
Models for PharmaManager ventes app.
"""

from django.db import models


class Vente(models.Model):
    """
    Represents a sale transaction in the pharmacy.

    Attributes:
        reference (str): Auto-generated unique code (e.g. VNT-2024-0001).
        date_vente (datetime): Date and time of the transaction.
        total_ttc (Decimal): Auto-calculated total amount.
        statut (str): Current status — EN_COURS, COMPLETEE, ANNULEE.
        notes (str): Optional remarks.
    """
    STATUT_CHOICES = [
        ('EN_COURS', 'En cours'),
        ('COMPLETEE', 'Complétée'),
        ('ANNULEE', 'Annulée'),
    ]

    reference = models.CharField(max_length=20, unique=True, editable=False, verbose_name='Référence')
    date_vente = models.DateTimeField(auto_now_add=True, verbose_name='Date de vente')
    total_ttc = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Total TTC')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='COMPLETEE', verbose_name='Statut')
    notes = models.TextField(blank=True, verbose_name='Notes')

    class Meta:
        verbose_name = 'Vente'
        verbose_name_plural = 'Ventes'
        ordering = ['-date_vente']

    def save(self, *args, **kwargs):
        if not self.reference:
            from django.utils import timezone
            year = timezone.now().year
            count = Vente.objects.filter(date_vente__year=year).count() + 1
            self.reference = f'VNT-{year}-{count:04d}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.reference

    def annuler(self):
        """Cancels the sale and restores all sold quantities back to stock."""
        if self.statut == 'ANNULEE':
            raise ValueError('Cette vente est déjà annulée.')
        for ligne in self.lignes.all():
            ligne.medicament.stock_actuel += ligne.quantite
            ligne.medicament.save()
        self.statut = 'ANNULEE'
        self.save()


class LigneVente(models.Model):
    """
    Represents one line item within a sale.

    Note:
        prix_unitaire is a snapshot of the price at the time of sale.
        Do NOT use a ForeignKey to price — prices may change over time.

    Attributes:
        vente (Vente): Parent sale.
        medicament (Medicament): Drug sold.
        quantite (int): Quantity sold.
        prix_unitaire (Decimal): Price snapshot at time of sale.
        sous_total (Decimal): Auto-calculated: quantite × prix_unitaire.
    """
    vente = models.ForeignKey(Vente, on_delete=models.CASCADE, related_name='lignes', verbose_name='Vente')
    medicament = models.ForeignKey('medicaments.Medicament', on_delete=models.PROTECT, verbose_name='Médicament')
    quantite = models.PositiveIntegerField(verbose_name='Quantité')
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Prix unitaire (snapshot)')
    sous_total = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Sous-total')

    class Meta:
        verbose_name = 'Ligne de vente'
        verbose_name_plural = 'Lignes de vente'

    def save(self, *args, **kwargs):
        self.sous_total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.vente.reference} — {self.medicament.nom} x{self.quantite}'
