from django.urls import path
from designer.views import *

urlpatterns = [
    path('',homepage,name = 'homepage'),
]