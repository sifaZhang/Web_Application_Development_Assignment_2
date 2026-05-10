from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PatientProfile, DoctorProfile, AppointmentSlot, Appointment


# 用户序列化（只暴露必要字段）
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


# 病人扩展信息
class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ["id", "user", "phone", "birthday"]


# 医生信息
class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = [
            "id",
            "name",
            "specialty",
            "description",
            "phone",
            "email",
            "is_active",
        ]


# 时间段（slot）
class AppointmentSlotSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=DoctorProfile.objects.all(),
        source="doctor",
        write_only=True
    )

    class Meta:
        model = AppointmentSlot
        fields = [
            "id",
            "doctor",
            "doctor_id",
            "date",
            "time",
            "is_booked",
        ]


# 预约记录
class AppointmentSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    slot = AppointmentSlotSerializer(read_only=True)
    slot_id = serializers.PrimaryKeyRelatedField(
        queryset=AppointmentSlot.objects.all(),
        source="slot",
        write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "slot",
            "slot_id",
            "status",
            "created_at",
        ]

    # 防止重复预约（后端硬验证）
    def validate(self, data):
        slot = data["slot"]
        if slot.is_booked:
            raise serializers.ValidationError("该时间段已被预约，请选择其他时间。")
        return data

    # 创建预约时自动标记 slot.is_booked = True
    def create(self, validated_data):
        slot = validated_data["slot"]
        slot.is_booked = True
        slot.save()

        appointment = Appointment.objects.create(**validated_data)
        return appointment


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user