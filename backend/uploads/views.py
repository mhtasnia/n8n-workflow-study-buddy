from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os

@csrf_exempt
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        # Create a directory to store uploaded files if it doesn't exist
        upload_dir = 'uploads/'
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        # Save the uploaded file
        with open(os.path.join(upload_dir, uploaded_file.name), 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        return JsonResponse({'message': 'File uploaded successfully!', 'file_name': uploaded_file.name})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)