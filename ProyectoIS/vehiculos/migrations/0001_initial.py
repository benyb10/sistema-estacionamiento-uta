# Generated by Django 5.2.1 on 2025-06-14 17:59

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Vehiculo',
            fields=[
                ('placa', models.CharField(max_length=10, primary_key=True, serialize=False, validators=[django.core.validators.RegexValidator(message='Formato de placa inválido (ej: ABC-1234 o AB-1234)', regex='^[A-Z]{3}-\\d{3,4}$|^[A-Z]{2}-\\d{4}$')])),
                ('marca', models.CharField(max_length=50)),
                ('modelo', models.CharField(max_length=100)),
                ('año', models.IntegerField()),
                ('color', models.CharField(max_length=30)),
                ('tipo_vehiculo', models.CharField(choices=[('AUTO', 'Automóvil'), ('MOTO', 'Motocicleta'), ('CAMIONETA', 'Camioneta'), ('BICICLETA', 'Bicicleta')], default='AUTO', max_length=20)),
                ('estado', models.CharField(choices=[('ACTIVO', 'Activo'), ('INACTIVO', 'Inactivo'), ('BLOQUEADO', 'Bloqueado')], default='ACTIVO', max_length=20)),
                ('fecha_registro', models.DateTimeField(auto_now_add=True)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
                ('observaciones', models.TextField(blank=True, null=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehiculos', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Vehículo',
                'verbose_name_plural': 'Vehículos',
            },
        ),
    ]
