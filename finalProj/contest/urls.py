from django.urls import path
from . import views

urlpatterns = [
    path('', views.contest_home, name='contest_home'),
    path('start/', views.start_contest, name='start_contest'),
    path('<int:contest_id>/', views.contest_page, name='contest_page'),
    path('submit/', views.submit_code, name='submit_code'),
    path('result/<int:contest_id>/', views.contest_result, name='contest_result'),
    path('run_code/', views.run_code, name='run_code'),
]