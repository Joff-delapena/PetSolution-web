import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa"; // Added FaEnvelope for email

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // New field for Name
  const [termsAccepted, setTermsAccepted] = useState(false); // Check for Terms acceptance
  const navigate = useNavigate();
  const auth = getAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("You must accept the terms and conditions to register.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      navigate("/login"); // Redirect to login page after register
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create an Account</h2>
      <form onSubmit={handleRegister} style={styles.form}>
        <div style={styles.inputGroup}>
          <FaUser style={styles.icon} />
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <FaEnvelope style={styles.icon} />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <FaLock style={styles.icon} />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Terms & Conditions checkbox */}
        <div style={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
            style={styles.checkbox}
          />
          <label style={styles.checkboxLabel}>
            I agree to the <a href="/terms" style={styles.link}>Terms and Conditions</a>
          </label>
        </div>

        <button type="submit" style={styles.submitButton}>
          Register
        </button>
      </form>
      <p style={styles.footerText}>
        Already have an account? <a href="/login" style={styles.link}>Login here</a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    maxWidth: "400px",
    margin: "0 auto",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  },
  heading: {
    marginBottom: "20px",
    color: "#333",
    fontSize: "24px",
    fontWeight: "600",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "10px",
  },
  icon: {
    marginRight: "10px",
    fontSize: "18px",
    color: "#FF9500",
  },
  input: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "16px",
    padding: "10px",
    borderRadius: "5px",
    color: "#333",
  },
  checkboxContainer: {
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
  },
  checkbox: {
    marginRight: "10px",
  },
  checkboxLabel: {
    fontSize: "14px",
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#FF9500",
    color: "#fff",
    padding: "12px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  submitButtonHover: {
    backgroundColor: "#e08900",
  },
  footerText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#888",
  },
  link: {
    color: "#FF9500",
    textDecoration: "none",
  },
};

export default Register;
