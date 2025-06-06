# Generated by Django 5.2 on 2025-04-21 06:10

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
            name='Sweep',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('date', models.DateField(auto_now_add=True)),
                ('products_selected', models.TextField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='SweepOutput',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('output_file', models.FileField(upload_to='outputs/')),
                ('scraped_file', models.FileField(blank=True, null=True, upload_to='outputs/')),
                ('sweep', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.sweep')),
            ],
        ),
        migrations.CreateModel(
            name='SweepProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product_name', models.CharField(max_length=100)),
                ('sweep', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to='api.sweep')),
            ],
        ),
    ]
