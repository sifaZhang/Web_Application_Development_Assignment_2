
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from clinic.views import DoctorViewSet, AppointmentSlotViewSet, AppointmentViewSet

router = DefaultRouter()
router.register(r"doctors", DoctorViewSet)
router.register(r"slots", AppointmentSlotViewSet)
router.register(r"appointments", AppointmentViewSet)

urlpatterns = [
    path("", include(router.urls)),
]