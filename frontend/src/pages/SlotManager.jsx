import { useState, useEffect } from "react";
import adminAxios from "../api/adminAxios";
import { useNavigate } from "react-router-dom";
import "./SlotManager.css";

export default function AdminSlots() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "Admin";

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [morningSlots, setMorningSlots] = useState([]);
    const [afternoonSlots, setAfternoonSlots] = useState([]);

    // 生成 15 分钟 slot
    const generateSlots = () => {
        const morning = [];
        const afternoon = [];

        for (let h = 8; h < 12; h++) {
            for (let m = 0; m < 60; m += 15) {
                morning.push({
                    time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
                    selected: false,
                });
            }
        }

        for (let h = 13; h < 17; h++) {
            for (let m = 0; m < 60; m += 15) {
                afternoon.push({
                    time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
                    selected: false,
                });
            }
        }

        return { morning, afternoon };
    };

    // 加载医生
    useEffect(() => {
        const token = localStorage.getItem("admin_access");

        adminAxios.get("/manage/doctors/", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setDoctors(res.data))
            .catch(() => alert("Failed to load doctors"));
    }, []);

    // 加载已有 slot（医生 AND 日期都选好后自动触发）
    useEffect(() => {
        if (!selectedDoctor || !selectedDate) {
            setMorningSlots([]);
            setAfternoonSlots([]);
            return;
        }

        const token = localStorage.getItem("admin_access");

        adminAxios
            .get(`/slots/?doctor=${selectedDoctor}&date=${selectedDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                const savedTimes = res.data.map(item => item.time.slice(0, 5));
                const base = generateSlots();

                setMorningSlots(
                    base.morning.map(s => ({
                        ...s,
                        selected: savedTimes.includes(s.time),
                    }))
                );

                setAfternoonSlots(
                    base.afternoon.map(s => ({
                        ...s,
                        selected: savedTimes.includes(s.time),
                    }))
                );
            })
            .catch(() => {
                const base = generateSlots();
                setMorningSlots(base.morning);
                setAfternoonSlots(base.afternoon);
            });
    }, [selectedDoctor, selectedDate]);

    // 勾选单个
    const toggleMorning = (i) => {
        const updated = [...morningSlots];
        updated[i].selected = !updated[i].selected;
        setMorningSlots(updated);
    };

    const toggleAfternoon = (i) => {
        const updated = [...afternoonSlots];
        updated[i].selected = !updated[i].selected;
        setAfternoonSlots(updated);
    };

    // 全选
    const selectAll = () => {
        setMorningSlots(morningSlots.map(s => ({ ...s, selected: true })));
        setAfternoonSlots(afternoonSlots.map(s => ({ ...s, selected: true })));
    };

    // 取消全选
    const unselectAll = () => {
        setMorningSlots(morningSlots.map(s => ({ ...s, selected: false })));
        setAfternoonSlots(afternoonSlots.map(s => ({ ...s, selected: false })));
    };

    // 上午全选
    const selectMorning = () =>
        setMorningSlots(morningSlots.map(s => ({ ...s, selected: true })));

    // 下午全选
    const selectAfternoon = () =>
        setAfternoonSlots(afternoonSlots.map(s => ({ ...s, selected: true })));

    // 保存
    const saveSlots = async () => {
        const token = localStorage.getItem("admin_access");

        const selectedTimes = [
            ...morningSlots.filter(s => s.selected).map(s => s.time),
            ...afternoonSlots.filter(s => s.selected).map(s => s.time),
        ];

        try {
            await adminAxios.post("/manage/slots/bulk_save/", {
                doctor_id: selectedDoctor,
                date: selectedDate,
                slots: selectedTimes,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Slots saved!");
        } catch (error) {
            console.log(error);
            alert("Failed to save slots");
        }
    };

    return (
        <div className="admin-container">

            <header className="admin-header">
                <h1><a href="/admin-dashboard">Admin Dashboard</a></h1>

                <div className="admin-user">
                    <span>Logged in as: {username}</span>
                    <button
                        className="logout-btn"
                        onClick={() => {
                            localStorage.clear();
                            navigate("/admin-login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <h2 className="dashboard-title">Appointment Slots Management</h2>
            <div className="slot-page">

                <div className="slot-card">
                    <h2 className="slot-subtitle">Select Doctor</h2>

                    <select
                        className="slot-select"
                        value={selectedDoctor ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedDoctor(value ? Number(value) : null);
                        }}
                    >
                        <option value="">-- Select Doctor --</option>
                        {doctors.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>

                    <h2 className="slot-subtitle">Select Date</h2>

                    <input
                        type="date"
                        className="slot-select"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>

                <div className="slot-card">
                    <h2 className="slot-subtitle">Available Time Slots</h2>

                    {!selectedDoctor || !selectedDate ? (
                        <p className="empty-text">Please select doctor and date.</p>
                    ) : (
                        <>
                            <div className="slot-buttons">
                                <button onClick={selectAll}>Select All</button>
                                <button onClick={unselectAll}>Unselect All</button>
                                <button onClick={selectMorning}>Morning</button>
                                <button onClick={selectAfternoon}>Afternoon</button>
                            </div>

                            <h3 className="slot-section-title">Morning (8:00 – 12:00)</h3>
                            <div className="slot-grid">
                                {morningSlots.map((slot, i) => (
                                    <label key={slot.time} className="slot-item">
                                        <input
                                            type="checkbox"
                                            checked={slot.selected}
                                            onChange={() => toggleMorning(i)}
                                        />
                                        {slot.time}
                                    </label>
                                ))}
                            </div>

                            <h3 className="slot-section-title">Afternoon (13:00 – 17:00)</h3>
                            <div className="slot-grid">
                                {afternoonSlots.map((slot, i) => (
                                    <label key={slot.time} className="slot-item">
                                        <input
                                            type="checkbox"
                                            checked={slot.selected}
                                            onChange={() => toggleAfternoon(i)}
                                        />
                                        {slot.time}
                                    </label>
                                ))}
                            </div>

                            <button className="slot-save-btn" onClick={saveSlots}>
                                Save Slots
                            </button>
                        </>
                    )}
                </div>
            </div>

            <footer className="admin-footer">
                © 2026 Piki Ora Medical Centre
            </footer>
        </div>
    );
}
