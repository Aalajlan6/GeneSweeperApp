from django.urls import path
from . import views

urlpatterns = [
    path('sweep/', views.sweep_view, name='sweep'),
]
