import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";
import styles from "../styles/ProfilePage.module.css";

interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData) {
      setProfile(userData);
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
      });
      setLoading(false);
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/update_profile",
        {
          first_name: formData.first_name,
          last_name: formData.last_name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.user) {
        // Update local storage with new user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setProfile(response.data.user);
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout activeMenu="profile">
      <div className={styles.profileContainer}>
        <h2>Profile</h2>
        {error && <div className={styles.error}>{error}</div>}
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <div className={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label>First Name:</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Last Name:</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton}>
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.profileInfo}>
            <div className={styles.infoGroup}>
              <label>Email:</label>
              <span>{profile?.email}</span>
            </div>
            <div className={styles.infoGroup}>
              <label>First Name:</label>
              <span>{profile?.first_name}</span>
            </div>
            <div className={styles.infoGroup}>
              <label>Last Name:</label>
              <span>{profile?.last_name}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
