from datetime import time, datetime, timedelta

from django.contrib.auth.models import User
from django.urls import reverse
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from .models import PatientProfile, DoctorProfile, AppointmentSlot, Appointment
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import user_passes_test, login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages

def home(request):
    return render(request, 'clinic/home.html')

def patient_register(request):
    if request.method == "POST":
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        phone = request.POST.get('phone', '')
        birthday = request.POST.get('birthday', None)

        # 创建 User
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # 创建 PatientProfile
        PatientProfile.objects.create(
            user=user,
            phone=phone,
            birthday=birthday
        )

        return redirect('patient_login')  # 注册成功跳转

    return render(request, 'registration/patient_register.html')


def patient_login(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('patient_dashboard')  # 登录成功跳转
        else:
            return render(request, 'registration/patient_login.html', {'error': 'Invalid username or password'})

    return render(request, 'registration/patient_login.html')


def admin_login(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user is not None and user.is_staff:
            login(request, user)
            return redirect('admin_dashboard')  # your custom dashboard
        else:
            return render(request, 'registration/admin_login.html', {
                'error': 'Invalid credentials or not an admin'
            })

    return render(request, 'registration/admin_login.html')


def user_logout(request):
    logout(request)
    return redirect('/')   # 登出后回到首页


def admin_required(user):
    return user.is_staff

@user_passes_test(admin_required)
def admin_dashboard(request):
    return render(request, 'clinic/admin_dashboard.html')


def admin_required(user):
    return user.is_staff

@user_passes_test(admin_required)
def doctor_manage(request):
    if request.method == "POST":
        action = request.POST.get("action")

        # 添加医生
        if action == "add":
            DoctorProfile.objects.create(
                name=request.POST["name"],
                specialty=request.POST["specialty"],
                description=request.POST.get("description", "")
            )

        # 编辑医生
        elif action == "edit":
            doctor = get_object_or_404(DoctorProfile, id=request.POST["doctor_id"])
            doctor.name = request.POST["name"]
            doctor.specialty = request.POST["specialty"]
            doctor.description = request.POST.get("description", "")
            doctor.save()

        # 删除医生
        elif action == "delete":
            doctor = get_object_or_404(DoctorProfile, id=request.POST["doctor_id"])
            doctor.delete()

        return redirect("doctor_manage")

    doctors = DoctorProfile.objects.all()
    return render(request, "clinic/doctor_manage.html", {"doctors": doctors})


@user_passes_test(admin_required)
def slot_manage(request):
    doctors = DoctorProfile.objects.all()

    # 自动生成 15 分钟 slot
    def generate_slots(start_hour, end_hour):
        slots = []
        current = time(start_hour, 0)
        end = time(end_hour, 0)

        while current < end:
            slots.append(current)
            dt = datetime.combine(datetime.today(), current) + timedelta(minutes=15)
            current = dt.time()

        return slots

    morning_slots = generate_slots(8, 12)
    afternoon_slots = generate_slots(13, 17)

    selected_doctor = request.GET.get("doctor")
    selected_date = request.GET.get("date")

    existing_slots = []
    if selected_doctor and selected_date:
        existing_slots = list(
            AppointmentSlot.objects.filter(
                doctor_id=selected_doctor,
                date=selected_date
            ).values_list("time", flat=True)
        )

    if request.method == "POST":
        doctor_id = request.POST["doctor"]
        date = request.POST["date"]
        selected_times = request.POST.getlist("slots")

        # 转换成 time 对象
        selected_times = [datetime.strptime(t, "%H:%M").time() for t in selected_times]

        # 找出需要删除的 slot
        to_delete = AppointmentSlot.objects.filter(
            doctor_id=doctor_id,
            date=date
        ).exclude(time__in=selected_times)

        to_delete.delete()

        # 找出需要新增的 slot
        existing_times = AppointmentSlot.objects.filter(
            doctor_id=doctor_id,
            date=date
        ).values_list("time", flat=True)

        for t in selected_times:
            if t not in existing_times:
                AppointmentSlot.objects.create(
                    doctor_id=doctor_id,
                    date=date,
                    time=t
                )

        return redirect(f"{reverse('slot_manage')}?doctor={doctor_id}&date={date}")

    return render(request, "clinic/slot_manage.html", {
        "doctors": doctors,
        "morning": morning_slots,
        "afternoon": afternoon_slots,
        "existing_slots": existing_slots,
        "selected_doctor": selected_doctor,
        "selected_date": selected_date,
    })

@user_passes_test(admin_required)
def patient_manage(request):
    if request.method == "POST":
        action = request.POST.get("action")

        # Edit patient
        if action == "edit":
            patient = get_object_or_404(PatientProfile, id=request.POST["patient_id"])
            patient.phone = request.POST["phone"]
            patient.birthday = request.POST["birthday"]
            patient.user.username = request.POST["username"]
            patient.user.email = request.POST["email"]
            patient.user.save()
            patient.save()

        # Delete patient
        elif action == "delete":
            patient = get_object_or_404(PatientProfile, id=request.POST["patient_id"])
            patient.user.delete()  # deletes both User + PatientProfile

        return redirect("patient_manage")

    patients = PatientProfile.objects.select_related("user").all()
    return render(request, "clinic/patient_manage.html", {"patients": patients})


@user_passes_test(admin_required)
def appointment_manage(request):
    username = request.GET.get("username", "")
    doctor_id = request.GET.get("doctor_id", "")
    date = request.GET.get("date", "")

    appointments = Appointment.objects.select_related(
        "patient",
        "slot",
        "slot__doctor"
    )

    if username:
        appointments = appointments.filter(patient__username__icontains=username)

    if doctor_id:
        appointments = appointments.filter(slot__doctor_id=doctor_id)

    if date:
        appointments = appointments.filter(slot__date=date)

    doctors = DoctorProfile.objects.all()

    if request.method == "POST":
        if request.POST.get("action") == "delete":
            appointment_id = request.POST.get("appointment_id")
            Appointment.objects.filter(id=appointment_id).delete()
            return redirect("appointment_manage")

    return render(request, "clinic/appointment_manage.html", {
        "appointments": appointments,
        "username": username,
        "doctor_id": doctor_id,
        "date": date,
        "doctors": doctors,
    })


@login_required
def patient_dashboard(request):
    patient = request.user  # 当前登录用户

    # 查询该用户的所有预约
    appointments = Appointment.objects.select_related(
        "slot",
        "slot__doctor"
    ).filter(patient=patient).order_by("slot__date", "slot__time")

    return render(request, "clinic/patient_dashboard.html", {
        "patient": patient,
        "appointments": appointments,
    })

def book_appointment(request):
    doctors = DoctorProfile.objects.all()
    slots = None

    selected_doctor = request.GET.get("doctor")
    selected_date = request.GET.get("date")

    if selected_doctor and selected_date:
        slots = AppointmentSlot.objects.filter(
            doctor_id=selected_doctor,
            date=selected_date
        ).exclude(
            appointment__isnull=False
        ).order_by("time")

    if request.method == "POST":
        slot_id = request.POST.get("slot")
        slot = AppointmentSlot.objects.get(id=slot_id)

        Appointment.objects.create(
            patient=request.user,
            slot=slot
        )

        # 发送邮件
        try:
            message = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails=request.user.email,
                subject='Appointment Booking Confirmation',
                html_content=f"""
                    <h3>Booking Confirmed!</h3>
                    <p>You have successfully booked an appointment with 
                    <strong>Dr {slot.doctor.name}</strong></p>
                    <p>Date: <strong>{slot.date}</strong></p>
                    <p>Time: <strong>{slot.time}</strong></p>
                    <p>Duration: 15 minutes</p>
                """
            )
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            response = sg.send(message)
            print("Email status code:", response.status_code)  # 添加这行
            messages.success(request, "Booking confirmed! A confirmation email has been sent.")
        except Exception as e:
            print("Email error:", str(e))  # 添加这行
            messages.success(request, "Booking confirmed! (Email could not be sent)")

        return redirect("patient_dashboard")

    return render(request, "clinic/book_appointment.html", {
        "doctors": doctors,
        "slots": slots,
        "selected_doctor": selected_doctor,
        "selected_date": selected_date,
    })

@login_required
def cancel_appointment(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id, patient=request.user)
    appointment.delete()
    messages.success(request, "Appointment cancelled successfully!")
    return redirect("patient_dashboard")


