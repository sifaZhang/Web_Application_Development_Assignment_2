from django.contrib.auth import authenticate
from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import DoctorProfile, AppointmentSlot, Appointment
from .serializers import (
    DoctorSerializer,
    AppointmentSlotSerializer,
    AppointmentSerializer,
    RegisterSerializer,
)

# 医生管理
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

# for patient
class DoctorListView(generics.ListAPIView):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorSerializer


# 权限：病人只能操作自己的预约
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.patient == request.user


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
        # 管理员可以查看所有预约
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAdminUser()]
        # 病人创建预约
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        # 病人查看自己的预约
        if self.action == "my":
            return [permissions.IsAuthenticated()]
        # 病人或管理员可以修改/取消预约
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsOwnerOrAdmin()]

        return [permissions.IsAdminUser()]

    @action(detail=False, methods=["get"])
    def my(self, request):
        appointments = Appointment.objects.filter(patient=request.user)
        serializer = AppointmentSerializer(
            appointments, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()

        # 权限：只有本人或管理员可以取消
        if not (request.user.is_staff or appointment.patient == request.user):
            return Response({"detail": "You don't have permission to cancel this appointment"}, status=403)

        # 如果已经取消
        if appointment.status == "cancelled":
            return Response({"detail": "This appointment has already been cancelled"}, status=400)

        # 释放 slot
        slot = appointment.slot
        slot.is_booked = False
        slot.save()

        # 更新预约状态
        appointment.status = "cancelled"
        appointment.save()

        return Response({"detail": "The appointment has cancelled successful"})


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def options(self, request, *args, **kwargs):
        return Response(status=200)

    def create(self, request, *args, **kwargs):
        print("REQUEST DATA:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("ERRORS:", serializer.errors)
        serializer.is_valid(raise_exception=True)
        return super().create(request, *args, **kwargs)



class LoginView(generics.GenericAPIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"detail": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })
