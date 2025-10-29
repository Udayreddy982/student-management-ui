import React, { useEffect, useState } from "react";
import axios from "axios";
import AddStudent from "./AddStudent";
import { toast } from "react-toastify";

// ✅ Base URL from .env
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function StudentList() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    age: "",
    email: "",
    course: "",
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5); // 5 per page

  // 🔹 Fetch all students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      toast.error("Error fetching students!");
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/students`, newStudent);
      fetchStudents();
      toast.success("Student added successfully!");
      setNewStudent({ name: "", age: "", email: "", course: "" });
    } catch (error) {
      toast.error("Failed to add student!");
      console.error("Add student error:", error);
    }
  };

  const handleEditChange = (e) => {
    setEditingStudent({ ...editingStudent, [e.target.name]: e.target.value });
  };

  const handleUpdateStudent = async (id) => {
    try {
      await axios.put(`${BASE_URL}/students/${id}`, editingStudent);
      fetchStudents();
      toast.success("Student updated successfully!");
      setEditingStudent(null);
    } catch (error) {
      toast.error("Failed to update student!");
      console.error("Update student error:", error);
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/students/${id}`);
      fetchStudents();
      toast.success("Student deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete student!");
      console.error("Delete student error:", error);
    }
  };

  // 🔹 Filter and paginate
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      {/* Add Student Form */}
      <AddStudent
        newStudent={newStudent}
        handleChange={handleNewChange}
        handleAdd={handleAddStudent}
      />

      {/* Search Bar + Button */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search by name or course"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            width: "250px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          onClick={fetchStudents}
          style={{
            backgroundColor: "#2b6cb0",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "8px 14px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
        >
          Search
        </button>
      </div>

      <h2>Student List</h2>

      {/* Loading Spinner */}
      {loading ? (
        <div className="spinner">
          <div className="loader"></div>
        </div>
      ) : currentStudents.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Email</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>
                    {editingStudent?.id === student.id ? (
                      <input
                        name="name"
                        value={editingStudent.name}
                        onChange={handleEditChange}
                      />
                    ) : (
                      student.name
                    )}
                  </td>
                  <td>
                    {editingStudent?.id === student.id ? (
                      <input
                        name="age"
                        value={editingStudent.age}
                        onChange={handleEditChange}
                      />
                    ) : (
                      student.age
                    )}
                  </td>
                  <td>
                    {editingStudent?.id === student.id ? (
                      <input
                        name="email"
                        value={editingStudent.email}
                        onChange={handleEditChange}
                      />
                    ) : (
                      student.email
                    )}
                  </td>
                  <td>
                    {editingStudent?.id === student.id ? (
                      <input
                        name="course"
                        value={editingStudent.course}
                        onChange={handleEditChange}
                      />
                    ) : (
                      student.course
                    )}
                  </td>
                  <td>
                    {editingStudent?.id === student.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateStudent(student.id)}
                        >
                          Save
                        </button>
                        <button onClick={() => setEditingStudent(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingStudent(student)}>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              style={{
                padding: "6px 12px",
                margin: "0 5px",
                backgroundColor: currentPage === 1 ? "#ccc" : "#2b6cb0",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor:
                  currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ◀ Previous
            </button>

            <span style={{ margin: "0 10px" }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 12px",
                margin: "0 5px",
                backgroundColor:
                  currentPage === totalPages ? "#ccc" : "#2b6cb0",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor:
                  currentPage === totalPages
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentList;
