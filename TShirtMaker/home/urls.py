from django.urls import path
from home.views import *

urlpatterns = [
    path('',homepage,name = 'homepage'),
    path("login/", login_page, name='login_page'),
    path("register/", register_page, name='register_page'),
    path("logout/", logout_page, name='logout_page'),
]