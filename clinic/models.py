from django.db import models
from django.contrib.auth.models import User

# 病人扩展信息
class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    birthday = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.user.username

class DoctorProfile(models.Model):
    name = models.CharField(max_length=100)  # 医生姓名
    specialty = models.CharField(max_length=100)  # 专业
    description = models.TextField(blank=True, null=True)  # 简介
    phone = models.CharField(max_length=20, blank=True)  # 联系电话
    email = models.EmailField(blank=True)  # 邮箱

    def __str__(self):
        return f"Dr. {self.name} ({self.specialty})"

# 医生可预约时间段
class AppointmentSlot(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()  # slot 开始时间，例如 09:00

    def __str__(self):
        return f"{self.doctor.name} - {self.date} {self.time}"


# 预约记录
class Appointment(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE)
    slot = models.ForeignKey(AppointmentSlot, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.username} -> {self.slot}"
