from django.urls import path
from GeneSweeper.views import home

urlpatterns = [
    # Home + Dashboard
    path('', home, name='home'),

]
