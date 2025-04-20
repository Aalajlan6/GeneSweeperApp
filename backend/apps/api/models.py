from django.db import models
from django.contrib.auth.models import User

class Sweep(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateField(auto_now_add=True)

class SweepProduct(models.Model):
    sweep = models.ForeignKey(Sweep, related_name='products', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=100)

class SweepOutput(models.Model):
    sweep = models.OneToOneField(Sweep, on_delete=models.CASCADE)
    output_file = models.FileField(upload_to='outputs/')
    scraped_file = models.FileField(upload_to='outputs/', null=True, blank=True)