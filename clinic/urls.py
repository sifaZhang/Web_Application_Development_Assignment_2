
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from clinic.views import DoctorViewSet, AppointmentSlotViewSet, AppointmentViewSet, LoginView
from clinic.views import RegisterView

router = DefaultRouter()
router.register(r"doctors", DoctorViewSet)
router.register(r"slots", AppointmentSlotViewSet)
router.register(r"appointments", AppointmentViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="auth_register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    # JWT 登录
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]