from django.test import TestCase
from .models import Salesperson

class SalespersonModelTest(TestCase):
    def setUp(self):
        self.salesperson = Salesperson.objects.create(
            first_name="Juan",
            last_name="Dela Cruz",
            sex='M'
        )

    def test_salesperson_creation(self):
        self.assertEqual(self.salesperson.first_name, "Juan")
        self.assertEqual(self.salesperson.last_name, "Dela Cruz")
        self.assertEqual(str(self.salesperson), "Juan Dela Cruz")
