from rest_framework import serializers
from .models import Sweep

class SweepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sweep
        fields = ['id', 'user', 'name', 'date', 'products_selected']