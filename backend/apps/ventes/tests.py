from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from apps.categories.models import Categorie
from apps.medicaments.models import Medicament
from apps.ventes.models import Vente


class VenteApiTests(APITestCase):
    def setUp(self):
        self.categorie = Categorie.objects.create(nom='Cat Vente', description='Test vente')
        self.medicament = Medicament.objects.create(
            nom='Med Vente',
            dci='DCI Vente',
            categorie=self.categorie,
            forme='Comprime',
            dosage='500mg',
            prix_achat='2.00',
            prix_vente='5.00',
            stock_actuel=10,
            stock_minimum=2,
            date_expiration=date.today() + timedelta(days=365),
            ordonnance_requise=False,
        )

    def test_create_vente_deducts_stock(self):
        payload = {
            'notes': 'test',
            'lignes': [
                {
                    'medicament_id': self.medicament.id,
                    'quantite': 3,
                }
            ],
        }

        response = self.client.post('/api/v1/ventes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.medicament.refresh_from_db()
        self.assertEqual(self.medicament.stock_actuel, 7)

    def test_annuler_vente_restores_stock_and_second_cancel_conflicts(self):
        create_payload = {
            'notes': 'test annulation',
            'lignes': [
                {
                    'medicament_id': self.medicament.id,
                    'quantite': 2,
                }
            ],
        }
        create_response = self.client.post('/api/v1/ventes/', create_payload, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        vente_id = create_response.data['id']

        self.medicament.refresh_from_db()
        self.assertEqual(self.medicament.stock_actuel, 8)

        first_cancel = self.client.post(f'/api/v1/ventes/{vente_id}/annuler/')
        self.assertEqual(first_cancel.status_code, status.HTTP_200_OK)

        self.medicament.refresh_from_db()
        self.assertEqual(self.medicament.stock_actuel, 10)

        second_cancel = self.client.post(f'/api/v1/ventes/{vente_id}/annuler/')
        self.assertEqual(second_cancel.status_code, status.HTTP_409_CONFLICT)

    def test_create_vente_rejects_insufficient_stock(self):
        payload = {
            'notes': 'stock insuffisant',
            'lignes': [
                {
                    'medicament_id': self.medicament.id,
                    'quantite': 50,
                }
            ],
        }

        response = self.client.post('/api/v1/ventes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
