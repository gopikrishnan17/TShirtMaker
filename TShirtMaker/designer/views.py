from django.shortcuts import render

# Create your views here.

def homepage(request):
    context = {
        'canvas_width': 800,  # Hardcoded for now
        'canvas_height': 600,  # Hardcoded for now
    }
    # return render(request, 'combined2.html', context)
    return render(request, 'tshirt_customizer_modular.html')
    # return render(request,'editor.html')

def editor(request):
    return render(request, 'editor.html')