from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.categories.models import Categorie
from apps.medicaments.models import Medicament


class MedicamentApiTests(APITestCase):
    def setUp(self):
        self.categorie = Categorie.objects.create(nom='Test Cat', description='Test')
        self.medicament_ok = Medicament.objects.create(
            nom='Med OK',
            dci='DCI OK',
            categorie=self.categorie,
            forme='Comprime',
            dosage='500mg',
            prix_achat='2.00',
            prix_vente='4.00',
            stock_actuel=20,
            stock_minimum=5,
            date_expiration=date.today() + timedelta(days=365),
            ordonnance_requise=False,
        )
        self.medicament_alerte = Medicament.objects.create(
            nom='Med Alerte',
            dci='DCI A',
            categorie=self.categorie,
            forme='Comprime',
            dosage='250mg',
            prix_achat='1.50',
            prix_vente='3.50',
            stock_actuel=2,
            stock_minimum=5,
            date_expiration=date.today() + timedelta(days=365),
            ordonnance_requise=True,
        )

    def test_alertes_returns_only_low_stock_medicaments(self):
        url = '/api/v1/medicaments/alertes/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {item['id'] for item in response.data}
        self.assertIn(self.medicament_alerte.id, returned_ids)
        self.assertNotIn(self.medicament_ok.id, returned_ids)

    def test_soft_delete_hides_medicament_from_default_queryset(self):
        delete_url = f'/api/v1/medicaments/{self.medicament_ok.id}/'
        list_url = '/api/v1/medicaments/'

        delete_response = self.client.delete(delete_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        self.medicament_ok.refresh_from_db()
        self.assertFalse(self.medicament_ok.est_actif)

        list_response = self.client.get(list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        returned_ids = {item['id'] for item in list_response.data['results']}
        self.assertNotIn(self.medicament_ok.id, returned_ids)
