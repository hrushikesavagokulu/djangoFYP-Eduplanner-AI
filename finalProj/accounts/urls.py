from django.urls import path
from . import views

urlpatterns = [

    # ── Auth ─────────────────────────────
    path('',            views.home,          name='home'),
    path('register/',   views.register_view, name='register'),
    path('login/',      views.login_view,    name='login'),
    path('logout/',     views.logout_view,   name='logout'),
    path('dashboard/',  views.dashboard,     name='dashboard'),
    path('admin/',      views.admin_page,    name='admin'),

    # ── Scheduler ────────────────────────
    path('scheduler/',      views.scheduler,           name='scheduler'),
    path('generate-plan/',  views.generate_plan_view,  name='generate_plan'),

    # ── CS Fundamentals ───────────────────
    path('csfund/',            views.csfund_view,        name='csfund'),
    path('csfund/generate/',   views.generate_csfund,    name='generate_csfund'),


path('scheduler/plans/', views.get_user_plans, name='get_user_plans'),
path('scheduler/plan/<int:plan_id>/', views.get_plan_detail, name='get_plan_detail'),
path('scheduler/day/<int:day_id>/toggle/', views.toggle_day_complete, name='toggle_day'),
path('scheduler/delete/<int:plan_id>/', views.delete_plan, name='delete_plan'),


path('courses/', views.courses_page, name='courses'),
path('courses/c/', views.c_course, name='c_course'),

    # Other Courses
    path('courses/python/', views.python_course, name='python_course'),
    path('courses/java/', views.java_course, name='java_course'),
    path('courses/node/', views.node_course, name='node_course'),
    path('courses/pylib/', views.pylib_course, name='pylib_course'),
    path('chatbot/', views.chatbot_view, name='chatbot'),
    path('chat/', views.chat_api, name='chat_api'),


path('csfund/plans/', views.get_cs_plans, name='get_cs_plans'),
path('csfund/plan/<int:plan_id>/', views.get_cs_plan_detail, name='get_cs_plan_detail'),
path('csfund/day/<int:day_id>/toggle/', views.toggle_cs_day, name='toggle_cs_day'),
path('csfund/delete/<int:plan_id>/', views.delete_cs_plan, name='delete_cs_plan'),


path("track/", views.track, name="track"),
    path("api/init/", views.init_tracker,name="init_tracker"),
    path("api/data/", views.get_data),
    path("api/add-task/", views.add_task),
    path("api/toggle/", views.toggle),
    path("api/add-day/", views.add_day),
    path("api/remove-day/", views.remove_day),
    path("api/delete-task/", views.delete_task),
    path("api/reset/", views.reset_tracker),
    path("api/charts/", views.chart_data),

path("scheduler-progress/", views.scheduler_progress, name="scheduler_progress"),
path("api/scheduler-progress/", views.scheduler_progress_api),

# CS DSA Recommendation
path('csfund/recommend/', views.recommend_view, name='recommend'),

 path("specific/", views.specificschedule_view, name="specificschedule"),

    path("generate-specific/", views.generate_specific_plan, name="generate_specific_plan"),

    path("get-specific-plan/", views.get_specific_plan, name="get_specific_plan"),
# path("ask/", views.ask_model, name="ask_model"),
   # Edge Cases Page
path('edgecases/', views.edgecase_page, name='edgecases'),

# API for frontend JS
path('api/edgecases/', views.edgecase_api, name='edgecases_api'),

path("api/recommend/", views.recommend_api, name="recommend_api"),
]