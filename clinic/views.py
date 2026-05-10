from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User

from .models import DoctorProfile, AppointmentSlot, Appointment
from .serializers import (
    DoctorSerializer,
    AppointmentSlotSerializer,
    AppointmentSerializer,
    RegisterSerializer,
)


# 权限：病人只能操作自己的预约
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.patient == request.user


# 医生管理
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


# 时间段管理
class AppointmentSlotViewSet(viewsets.ModelViewSet):
    queryset = AppointmentSlot.objects.all()
    serializer_class = AppointmentSlotSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


# 预约管理
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsOwnerOrAdmin()]
        if self.action in ["create"]:
            return [permissions.IsAuthenticated()]
        if self.action == "my":
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    # 病人查看自己的预约
    @action(detail=False, methods=["get"])
    def my(self, request):
        appointments = Appointment.objects.filter(patient=request.user)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    # 创建预约时自动绑定 patient
    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
