from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm

import os
import pandas as pd
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.conf import settings
from io import StringIO

BASE_DIR = settings.BASE_DIR
csv_file_path = os.path.join(BASE_DIR, 'CSV_files')

all_products = []
for file in os.listdir(csv_file_path):
    if file.endswith(".csv"):
        df = pd.read_csv(os.path.join(csv_file_path, file), delimiter='\t')
        products = df['PRODUCT NAME'].unique()
        all_products.extend(products)
all_products = list(set(all_products))

global_df = pd.concat(
    pd.read_csv(os.path.join(csv_file_path, file), delimiter='\t') for file in os.listdir(csv_file_path) if file.endswith(".csv")
)
def home(request):
    return render(request, 'about.html')


def sweep_view(request):
    if request.method == 'POST':
        selected_products = request.POST.getlist('products')
        if selected_products:
            filtered_df = global_df[global_df['PRODUCT NAME'].str.lower().isin([p.lower() for p in selected_products])]

            # Create CSV in memory
            csv_buffer = StringIO()
            filtered_df.to_csv(csv_buffer, index=False)
            csv_buffer.seek(0)

            # Send file directly without saving to disk
            response = HttpResponse(csv_buffer, content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="sweep_output.csv"'
            return response
        else:
            return render(request, 'sweep_page.html', {'products': all_products, 'error': 'Please select products.'})

    return render(request, 'sweep_page.html', {'products': all_products})
def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'register.html', {'form': form})

