from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm

import os
import pandas as pd
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.conf import settings
from io import StringIO
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

uploaded_dataframes = {}

@csrf_exempt
def upload_csv(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.get('csv_file')
        if not uploaded_file:
            return JsonResponse({'error': 'No file uploaded'}, status=400)
        
        df = pd.read_csv(uploaded_file, delimiter='\t')
        session_id = request.META.get('REMOTE_ADDR')  # Use IP address as session ID for simplicity
        uploaded_dataframes[session_id] = df

        products = df['PRODUCT NAME'].unique().tolist()
        

        return JsonResponse({'products': products}, status=200)
    return JsonResponse({'error': 'Only POST method allowed.'}, status=405)

@csrf_exempt
def export_csv(request):
    if request.method == 'POST':
        session_id = request.META.get('REMOTE_ADDR')
        df = uploaded_dataframes.get(session_id)

        if df is None:
            return JsonResponse({'error': 'No uploaded data found.'}, status=400)

        selected_products = request.POST.getlist('products[]')
        if not selected_products:
            return JsonResponse({'error': 'No products selected.'}, status=400)

        filtered_df = df[df['PRODUCT NAME'].str.lower().isin([p.lower() for p in selected_products])]
        
        # Shorten the file name based on selected products
        short_names = [p.replace(' ', '')[:5] for p in selected_products]
        filename = '_'.join(short_names) + '.csv'

        # Create CSV in memory
        csv_buffer = StringIO()
        filtered_df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)

        response = HttpResponse(csv_buffer, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    return JsonResponse({'error': 'Only POST allowed'}, status=405)