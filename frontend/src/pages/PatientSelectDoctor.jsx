import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function PatientSelectSlot() {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [date, setDate] = useState("");
    const [slots, setSlots] = useState([]);

    const loadSlots = () => {
        if (!date) return;

        axios.get(`http://127.0.0.1:8000/api/slots/?doctor=${doctorId}&date=${date}`)
            .then(res => {
                const available = res.data.filter(s => !s.is_booked);
                setSlots(available);
            });
    };

    useEffect(() => {
        if (date) loadSlots();
    }, [date]);

    return (
        <div className="page">
            <h2>Select Date</h2>

            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            {date && (
                <>
                    <h3>Available Slots</h3>

                    <div className="slot-list">
                        {slots.map(s => (
                            <div
                                key={s.id}
                                className="slot-item"
                                onClick={() => navigate(`/book/info/${s.id}`)}
                            >
                                {s.time.slice(0, 5)}
                            </div>
                        ))}

                        {slots.length === 0 && <p>No available slots.</p>}
                    </div>
                </>
            )}
        </div>
    );
}
