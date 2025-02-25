from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
# Create your views here.
@login_required(login_url='/login/')
def homepage(request):
    return render(request, 'homepage.html')

def login_page(request):
    if request.method == 'POST':
        data = request.POST
        email = data.get('email')
        password = data.get('password')

        user = User.objects.filter(username=email)
        if not user.exists():
            messages.info(request,'Email doesn\'t exist, Please register to proceed.')
            return redirect('/register/')
        else:
            user = authenticate(username=email, password=password)
            if user:
                login(request, user)
                return redirect('/')
            else:
                messages.info(request,'Wrong Username/Password')
                return redirect('/login/')
    return render(request,'login.html')

def register_page(request):
    if request.method == 'POST':
        data = request.POST
        email = data.get('email')
        password = data.get('password')

        user = User.objects.filter(username=email)
        if user.exists():
            messages.info(request,'Email already in use')
            return redirect('/register/')

        user = User.objects.create(
            username = email
        )
        user.set_password(password)
        user.save()
        return redirect('/login/')

    return render(request,'register.html')

@login_required(login_url='/login/')
def logout_page(request):
    logout(request)
    return redirect('/')

