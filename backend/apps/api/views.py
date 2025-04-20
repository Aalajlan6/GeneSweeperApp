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

@csrf_exempt
def upload_csv(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.get('csv_file')
        if not uploaded_file:
            return JsonResponse({'error': 'No file uploaded'}, status=400)
        
        df = pd.read_csv(uploaded_file, delimiter='\t')

        print(df.head(5))

        return JsonResponse({'message': 'File uploaded successfully'}, status=200)
    return JsonResponse({'error': 'Only POST method allowed.'}, status=405)