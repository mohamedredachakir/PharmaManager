from django.db import migrations, models
from django.utils import timezone


def backfill_categorie_date_creation(apps, schema_editor):
    Categorie = apps.get_model('categories', 'Categorie')
    Categorie.objects.filter(date_creation__isnull=True).update(date_creation=timezone.now())


class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0002_alter_categorie_date_creation'),
    ]

    operations = [
        migrations.RunPython(backfill_categorie_date_creation, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='categorie',
            name='date_creation',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
