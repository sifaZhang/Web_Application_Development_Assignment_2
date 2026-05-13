import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>Piki Ora Medical Centre</h1>
      <p className={styles.subtitle}>Your trusted healthcare appointment system</p>

      <div className={styles.loginCard}>
        <h2>Welcome</h2>

        <button className={`${styles.btn} ${styles.patient}`} onClick={() => navigate("/patient-login")}>
          Patient Login
        </button>

        <button className={`${styles.btn} ${styles.register}`} onClick={() => navigate("/register")}>
          Patient Registration
        </button>

        <button className={`${styles.btn} ${styles.admin}`} onClick={() => navigate("/admin-login")}>
          Admin Login
        </button>

        <p className={styles.copyright}>© 2026 Piki Ora Medical Centre</p>
      </div>
    </div>
  );
}
