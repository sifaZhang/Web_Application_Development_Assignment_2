from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.patient_register, name='patient_register'),
    path('login/', views.patient_login, name='patient_login'),
    path('logout/', views.user_logout, name='logout'),
    path('admin-login/', views.admin_login, name='admin_login'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path("doctors/", views.doctor_manage, name="doctor_manage"),
    path("slots/", views.slot_manage, name="slot_manage"),
    path("patients/", views.patient_manage, name="patient_manage"),
    path("appointments/", views.appointment_manage, name="appointment_manage"),
    path("patient-dashboard/", views.patient_dashboard, name="patient_dashboard"),
    path('book/', views.book_appointment, name='book_appointment'),
    path("appointment/<int:appointment_id>/cancel/", views.cancel_appointment, name="cancel_appointment"),

]