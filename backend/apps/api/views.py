from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
import os
import pandas as pd
from django.http import HttpResponse
from django.conf import settings
from io import StringIO
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .serializers import SweepSerializer
from .models import Sweep
from rest_framework.permissions import IsAuthenticated

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


@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=400)
    
    try:
        validate_password(password)
    except ValidationError as e:
        return Response({'error': str(e)}, status=400)
    
    user = User.objects.create_user(username=username, password=password)

    return Response({'message': 'User created successfully.'}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_sweeps(request):
    user = request.user
    sweeps = Sweep.objects.filter(user=request.user).order_by('-date')
    serializer = SweepSerializer(sweeps, many=True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_sweep(request):
    products = request.data.get('products', [])
    name = request.data.get('name', '')

    if not products or not name:
        return Response({'error': 'Products and file name are required.'}, status=400)
    
    Sweep.objects.create(
        user=request.user,
        name=name,
        products_selected=', '.join(products)
    )

    return Response({'message': 'Sweep saved successfully.'}, status=201)