"""Defines URL patterns for fileshare"""

from django.urls import path
from . import views

app_name = "secureshare"
urlpatterns = [
    path("", views.index, name="index"),
]
