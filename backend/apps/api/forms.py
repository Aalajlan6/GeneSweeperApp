from django import forms
from .models import Sweep

class SweepForm(forms.ModelForm):
    class Meta:
        model = Sweep
        fields = ['name']