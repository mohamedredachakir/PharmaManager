from django.db import migrations, models
from django.utils import timezone


def backfill_medicament_date_creation(apps, schema_editor):
    Medicament = apps.get_model('medicaments', 'Medicament')
    Medicament.objects.filter(date_creation__isnull=True).update(date_creation=timezone.now())


class Migration(migrations.Migration):

    dependencies = [
        ('medicaments', '0002_alter_medicament_date_creation'),
    ]

    operations = [
        migrations.RunPython(backfill_medicament_date_creation, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='medicament',
            name='date_creation',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
